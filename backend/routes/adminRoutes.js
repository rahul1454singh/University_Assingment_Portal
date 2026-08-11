const express = require("express");
const { verifyAdmin } = require("../middleware/authMiddleware");
const Department = require("../models/Department");
const UserData = require("../models/UserData");
const Admin = require("../models/Admin");

const router = express.Router();


// =======================
// EJS Dashboard (Keep Existing)
// =======================
router.get("/admin/dashboard", verifyAdmin, async (req, res) => {

  try {

    const totalDepartments = await Department.countDocuments();

    const totalStudents = await UserData.countDocuments({
      role: "student"
    });

    const totalProfessors = await UserData.countDocuments({
      role: "professor"
    });

    const totalHODs = await UserData.countDocuments({
      role: "hod"
    });

    const totalAdmins = await Admin.countDocuments();

    const adminName =
      req.admin && (req.admin.name || req.admin.email);

    res.render("admin-dashboard", {
      totalDepartments,
      totalStudents,
      totalProfessors,
      totalHODs,
      totalAdmins,
      adminName
    });

  } catch (err) {

    console.error("Admin dashboard error:", err);

    res.send("Error loading dashboard");

  }

});


// =======================
// React Dashboard API
// =======================
const ActivityLog = require("../models/ActivityLog");

router.get("/admin/dashboard/stats", verifyAdmin, async (req, res) => {

    try {

        const totalDepartments = await Department.countDocuments();

       const totalStudents = await UserData.countDocuments({
              role: { $regex: /^student$/i }
        });

        const totalProfessors = await UserData.countDocuments({
            role: { $regex: /^professor$/i }
        });

        const totalUsers = await UserData.countDocuments();

        const totalAdmins = await Admin.countDocuments();

        res.json({

            success: true,

            stats: {

                departments: totalDepartments,

                students: totalStudents,

                professors: totalProfessors,

                users: totalUsers,

                admins: totalAdmins

            }

        });

    } catch (err) {

        console.error("Admin stats error:", err);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }

});

// =======================
// GET RECENT ACTIVITIES API (Admin Actions Only)
// =======================
router.get("/admin/activities", verifyAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { isAdminAction: { $ne: false } };

    const totalItems = await ActivityLog.countDocuments(filter);
    
    // Seed if empty (keep this logic)
    if (totalItems === 0) {
      await ActivityLog.create([
        {
          title: "New Department Created",
          description: "Department Computer Science & Engineering was created by System Admin.",
          userName: "System Admin",
          isAdminAction: true
        },
        {
          title: "New User Created",
          description: "New user System Administrator was created by System Admin.",
          userName: "System Admin",
          isAdminAction: true
        },
        {
          title: "Profile Updated",
          description: "University Assignment Portal settings were updated by System Admin.",
          userName: "System Admin",
          isAdminAction: true
        }
      ]);
    }

    const updatedTotalItems = await ActivityLog.countDocuments(filter);
    const totalPages = Math.ceil(updatedTotalItems / limit) || 1;

    const activities = await ActivityLog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.json({
      success: true,
      activities,
      totalItems: updatedTotalItems,
      totalPages,
      currentPage: page
    });
  } catch (err) {
    console.error("Activities error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to load activities"
    });
  }
});

module.exports = router;