const express = require("express");
const Complaint = require("../models/Complaint");
const { verifyAdmin, verifyAnyUser } = require("../middleware/authMiddleware");

const router = express.Router();

// =======================
// CREATE COMPLAINT (Student / Professor)
// =======================
router.post("/api/complaints", verifyAnyUser, async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message content is required"
      });
    }

    const currentUser = req.user || req.admin;
    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const newComplaint = await Complaint.create({
      senderId: currentUser._id,
      senderName: currentUser.name || "Anonymous",
      senderEmail: currentUser.email || "",
      senderRole: currentUser.role || "student",
      message: message.trim(),
      status: "Pending",
      isRead: false
    });

    return res.status(201).json({
      success: true,
      message: "Complaint sent to Admin successfully",
      complaint: newComplaint
    });
  } catch (err) {
    console.error("Complaint creation error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to send complaint"
    });
  }
});

// =======================
// GET ALL COMPLAINTS (Admin)
// =======================
router.get("/api/admin/complaints", verifyAdmin, async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 }).lean();
    return res.json({
      success: true,
      complaints
    });
  } catch (err) {
    console.error("Fetch complaints error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch complaints"
    });
  }
});

// =======================
// GET UNREAD COMPLAINTS COUNT (Admin)
// =======================
router.get("/api/admin/complaints/unread-count", verifyAdmin, async (req, res) => {
  try {
    const count = await Complaint.countDocuments({ isRead: false });
    return res.json({
      success: true,
      unreadCount: count
    });
  } catch (err) {
    console.error("Unread count error:", err);
    return res.status(500).json({
      success: false,
      unreadCount: 0
    });
  }
});

// =======================
// MARK ALL COMPLAINTS AS READ (Admin)
// =======================
router.put("/api/admin/complaints/mark-read", verifyAdmin, async (req, res) => {
  try {
    await Complaint.updateMany({ isRead: false }, { $set: { isRead: true } });
    return res.json({
      success: true,
      message: "All complaints marked as read"
    });
  } catch (err) {
    console.error("Mark read error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to mark complaints as read"
    });
  }
});

// =======================
// UPDATE COMPLAINT STATUS (Admin)
// =======================
router.put("/api/admin/complaints/:id/status", verifyAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    return res.json({
      success: true,
      complaint
    });
  } catch (err) {
    console.error("Update complaint error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to update complaint"
    });
  }
});

module.exports = router;
