const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();

const Assignment = require("../models/Assignment");
const Professor = require("../models/Professor");
const Notification = require("../models/Notification");
const { verifyProfessor } = require("../middleware/authMiddleware");

/* =================================================
   DASHBOARD HANDLER (REUSED)
================================================= */
async function dashboardHandler(req, res) {
  try {
    if (!req.professor || !req.professor._id) {
      return res.status(401).send("Unauthorized");
    }

    const professorId = req.professor._id;

    const pendingCount = await Assignment.countDocuments({
      professor: professorId,
      status: "Draft"
    });
    const approvedCount = await Assignment.countDocuments({
      professor: professorId,
      status: "Approved"
    });
    const rejectedCount = await Assignment.countDocuments({
      professor: professorId,
      status: "Rejected"
    });

    const totalReviewed = approvedCount + rejectedCount;

    const allReviews = await Assignment.find({
      professor: professorId
    })
      .populate("user", "name email phone")
      .sort({ submittedAt: -1 })
      .lean();

    const now = new Date();
    const withDays = (a) => {
      const base = a.submittedAt || a.createdAt;
      const daysPending = Math.floor(
        (now - new Date(base)) / (1000 * 60 * 60 * 24)
      );
      return { ...a, daysPending };
    };

    res.json({
      professorName: req.professor.name,
      counts: {
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
        total: totalReviewed
      },
      allReviews: allReviews.map(withDays)
    });
  } catch (err) {
    console.error("Professor dashboard error:", err);
    res.status(500).send("Server error");
  }
}

/* =================================================
   PROFILE GET HANDLER
================================================= */
async function profileGetHandler(req, res) {
  try {
    if (!req.professor || !req.professor._id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const professor = await Professor.findById(req.professor._id)
      .populate("department", "name")
      .populate("departments", "name")
      .lean();

    if (!professor) {
      return res.status(404).json({ error: "Professor not found" });
    }

    let depNames = [];
    if (Array.isArray(professor.departments) && professor.departments.length > 0) {
      depNames = professor.departments.map(d => d.name).filter(Boolean);
    }
    if (depNames.length === 0 && professor.department && professor.department.name) {
      depNames.push(professor.department.name);
    }

    const profData = {
      name: professor.name || "",
      email: professor.email || "",
      phone: professor.phone || "",
      departmentName: depNames.join(", ") || professor.department?.name || "General",
      departments: depNames,
      profileImage: professor.profileImage || ""
    };

    if (req.xhr || req.headers.accept?.includes("json") || req.path.startsWith("/professor")) {
      return res.json({ success: true, professor: profData });
    }

    res.render("professor-profile", { professor: profData });
  } catch (err) {
    console.error("Professor profile error:", err);
    res.status(500).json({ error: "Server error" });
  }
}

const { logActivity } = require("../utils/activityLogger");

/* =================================================
   PROFILE POST HANDLER
================================================= */
async function profilePostHandler(req, res) {
  try {
    if (!req.professor || !req.professor._id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { phone, newPassword, profileImage } = req.body;
    const update = {};

    if (phone !== undefined) update.phone = phone;
    if (profileImage !== undefined) update.profileImage = profileImage;

    if (newPassword) {
      update.password = await bcrypt.hash(newPassword, 10);
      await logActivity("Password Changed", `Professor ${req.professor.name} updated their password.`, req.professor.name, req.professor._id, false);
    }

    const updated = await Professor.findByIdAndUpdate(
      req.professor._id,
      update,
      { new: true }
    ).populate("department", "name");

    await logActivity("Profile Updated", `Professor ${req.professor.name} updated their profile information.`, req.professor.name, req.professor._id, false);

    res.json({
      success: true,
      message: "Profile updated successfully",
      professor: {
        name: updated.name || "",
        email: updated.email || "",
        phone: updated.phone || "",
        departmentName: updated.department?.name || "General",
        profileImage: updated.profileImage || ""
      }
    });
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({ error: "Update failed" });
  }
}


/* =================================================
   ROUTES & ALIASES
================================================= */
router.get("/dashboard", verifyProfessor, dashboardHandler);
router.get("/profile", verifyProfessor, profileGetHandler);
router.post("/profile", verifyProfessor, profilePostHandler);

router.get("/professor/dashboard", verifyProfessor, dashboardHandler);
router.get("/professor/profile", verifyProfessor, profileGetHandler);
router.post("/professor/profile", verifyProfessor, profilePostHandler);

/* REVIEW ASSIGNMENT (GET) */
async function reviewHandler(req, res) {
  try {
    if (!req.professor || !req.professor._id) {
      return res.status(401).send("Unauthorized");
    }

    const assignment = await Assignment.findOne({
      _id: req.params.id,
      reviewerId: req.professor._id
    }).populate("user", "name email phone");

    if (!assignment) {
      return res.status(404).send("Assignment not found");
    }

    res.json({
      assignment,
      professorName: req.professor.name,
      professorEmail: req.professor.email
    });
  } catch (err) {
    console.error("Review page error:", err);
    res.status(500).send("Server error");
  }
}

router.get("/assignments/:id/review", verifyProfessor, reviewHandler);
router.get("/professor/assignments/:id/review", verifyProfessor, reviewHandler);

/* DECISION (POST) */
async function decisionHandler(req, res) {
  try {
    const { status, remarks } = req.body;

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid action" });
    }

    const assignment = await Assignment.findOne({
      _id: req.params.id,
      reviewerId: req.professor._id
    });

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    assignment.reviewHistory ||= [];
    assignment.status = status;
    assignment.rejectionRemarks = status === "Rejected" ? remarks : (remarks || "");

    assignment.reviewHistory.push({
      action: status,
      professorId: req.professor._id,
      professorName: req.professor.name,
      remarks
    });

    await assignment.save();

    await Notification.create({
      userId: assignment.user,
      title: `Assignment ${status}`,
      message: `Your assignment "${assignment.title}" has been ${status.toLowerCase()}.`,
      assignmentId: assignment._id
    });

    res.json({
      message:
        status === "Approved"
          ? "Assignment approved successfully"
          : "Assignment rejected successfully"
    });
  } catch (err) {
    console.error("Decision error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

router.post("/assignments/:id/decision", verifyProfessor, decisionHandler);
router.post("/professor/assignments/:id/decision", verifyProfessor, decisionHandler);

module.exports = router;
