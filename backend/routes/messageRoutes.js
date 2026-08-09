const express = require("express");
const jwt = require("jsonwebtoken");
const UserData = require("../models/UserData");
const Message = require("../models/Message");
const Department = require("../models/Department");

const router = express.Router();

// Middleware to authenticate any logged in user (student, professor, hod, admin)
const verifyUserToken = async (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (!payload || !payload.id) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    const user = await UserData.findById(payload.id).lean();
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Session expired or invalid" });
  }
};

// Helper: Extract all department ObjectIds for a user (backward compatible with single department)
const getUserDepartmentIds = (user) => {
  if (!user) return [];
  const ids = [];

  if (Array.isArray(user.departments) && user.departments.length > 0) {
    user.departments.forEach((dep) => {
      if (dep) {
        const idStr = typeof dep === "object" && dep._id ? dep._id.toString() : dep.toString();
        if (idStr && !ids.includes(idStr)) ids.push(idStr);
      }
    });
  }

  if (user.department) {
    const singleIdStr = typeof user.department === "object" && user.department._id ? user.department._id.toString() : user.department.toString();
    if (singleIdStr && !ids.includes(singleIdStr)) {
      ids.push(singleIdStr);
    }
  }

  return ids;
};

// Helper: Verify if two users share at least one department
const doUsersShareDepartment = async (userId1, userId2) => {
  const user1 = await UserData.findById(userId1).lean();
  const user2 = await UserData.findById(userId2).lean();

  if (!user1 || !user2) return false;

  const deps1 = getUserDepartmentIds(user1);
  const deps2 = getUserDepartmentIds(user2);

  return deps1.some((depId) => deps2.includes(depId));
};

// =====================================================
// GET CONTACTS (Filtered strictly by shared departments)
// =====================================================
router.get("/api/messages/contacts", verifyUserToken, async (req, res) => {
  try {
    const userRole = (req.user.role || "").toLowerCase();
    const userDepIds = getUserDepartmentIds(req.user);

    if (userDepIds.length === 0) {
      return res.json({ success: true, contacts: [] });
    }

    // Determine target role: Student -> Professors, Professor/HOD -> Students
    const targetRole = userRole === "student" ? "professor" : "student";

    const queryFilter = {
      role: { $regex: new RegExp(`^${targetRole}$`, "i") },
      $or: [
        { departments: { $in: userDepIds } },
        { department: { $in: userDepIds } }
      ]
    };

    const contactsRaw = await UserData.find(queryFilter)
      .populate("departments", "name")
      .populate("department", "name")
      .select("_id name email role profileImage isOnline lastSeen departments department")
      .lean();

    // Format contacts with department names and calculate unread messages
    const formattedContacts = await Promise.all(
      contactsRaw.map(async (c) => {
        let depNames = [];
        if (Array.isArray(c.departments) && c.departments.length > 0) {
          depNames = c.departments.map((d) => d.name).filter(Boolean);
        }
        if (depNames.length === 0 && c.department && c.department.name) {
          depNames.push(c.department.name);
        }

        // Count unread messages sent by this contact to current user
        const unreadCount = await Message.countDocuments({
          sender: c._id,
          receiver: req.user._id,
          read: false
        });

        return {
          _id: c._id,
          name: c.name || "User",
          email: c.email,
          role: c.role,
          profileImage: c.profileImage || "",
          isOnline: !!c.isOnline,
          lastSeen: c.lastSeen || c.updatedAt || new Date(),
          departments: depNames,
          departmentName: depNames.join(", ") || "General",
          unreadCount
        };
      })
    );

    return res.json({
      success: true,
      contacts: formattedContacts
    });
  } catch (err) {
    console.error("Fetch contacts error:", err);
    return res.status(500).json({ success: false, message: "Error loading contacts" });
  }
});

// =====================================================
// GET CHAT HISTORY (Enforces shared department security)
// =====================================================
router.get("/api/messages/history/:contactId", verifyUserToken, async (req, res) => {
  try {
    const { contactId } = req.params;
    const currentUserId = req.user._id;

    // Security Check: Verify shared department
    const isAllowed = await doUsersShareDepartment(currentUserId, contactId);
    if (!isAllowed) {
      return res.status(403).json({
        success: false,
        message: "Security Error: You can only communicate with users in your assigned department(s)."
      });
    }

    // Fetch conversation history
    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: contactId },
        { sender: contactId, receiver: currentUserId }
      ]
    })
      .sort({ createdAt: 1 })
      .lean();

    // Mark unread messages sent from contact to current user as read & seen
    await Message.updateMany(
      { sender: contactId, receiver: currentUserId, read: false },
      { $set: { read: true, status: "seen" } }
    );

    return res.json({
      success: true,
      messages
    });
  } catch (err) {
    console.error("Chat history error:", err);
    return res.status(500).json({ success: false, message: "Error loading conversation history" });
  }
});

// =====================================================
// SEND MESSAGE (Enforces shared department security)
// =====================================================
router.post("/api/messages/send", verifyUserToken, async (req, res) => {
  try {
    const { receiverId, message } = req.body;
    const currentUserId = req.user._id;

    if (!receiverId || !message || !message.trim()) {
      return res.status(400).json({ success: false, message: "Message and recipient are required" });
    }

    // Security Check: Verify shared department
    const isAllowed = await doUsersShareDepartment(currentUserId, receiverId);
    if (!isAllowed) {
      return res.status(403).json({
        success: false,
        message: "Security Error: Communication prohibited. Users do not share a department."
      });
    }

    const newMessage = await Message.create({
      sender: currentUserId,
      receiver: receiverId,
      message: message.trim(),
      status: "sent",
      read: false
    });

    return res.status(201).json({
      success: true,
      message: newMessage
    });
  } catch (err) {
    console.error("Send message error:", err);
    return res.status(500).json({ success: false, message: "Failed to send message" });
  }
});

// =====================================================
// MARK MESSAGES AS READ
// =====================================================
router.put("/api/messages/mark-read/:contactId", verifyUserToken, async (req, res) => {
  try {
    const { contactId } = req.params;
    const currentUserId = req.user._id;

    await Message.updateMany(
      { sender: contactId, receiver: currentUserId, read: false },
      { $set: { read: true, status: "seen" } }
    );

    return res.json({ success: true, message: "Messages marked as read" });
  } catch (err) {
    console.error("Mark read error:", err);
    return res.status(500).json({ success: false, message: "Error marking messages as read" });
  }
});

// =====================================================
// GET TOTAL UNREAD DIRECT MESSAGE COUNT
// =====================================================
router.get("/api/messages/unread-count", verifyUserToken, async (req, res) => {
  try {
    const totalUnread = await Message.countDocuments({
      receiver: req.user._id,
      read: false
    });

    return res.json({
      success: true,
      unreadCount: totalUnread
    });
  } catch (err) {
    console.error("Unread count error:", err);
    return res.status(500).json({ success: false, message: "Error fetching unread message count" });
  }
});

module.exports = router;
