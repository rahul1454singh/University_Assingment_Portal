const express = require("express");
const bcrypt = require("bcryptjs");

const { verifyAdmin } = require("../middleware/authMiddleware");
const Department = require("../models/Department");
const UserData = require("../models/UserData");
const Notification = require("../models/Notification");
const { logActivity } = require("../utils/activityLogger");
const { sendWelcomeEmail, sendAdminUserUpdateEmail } = require("../utils/emailService");

const router = express.Router();

const getDepartments = () => Department.find().sort({ name: 1 });

// =======================
// GET ALL DEPARTMENTS (Dropdown)
// =======================
router.get("/admin/departments/options", verifyAdmin, async (req, res) => {
  try {
    const departments = await Department.find().sort({ name: 1 });

    res.json({
      success: true,
      departments,
    });
  } catch (err) {

    console.error(err);

    res.status(500).json({
        success: false,
        message: "Server Error"
    });

}
});


// =======================
// CREATE USER
// =======================
router.post("/admin/users", verifyAdmin, async (req, res) => {
  try {
    const { name, email, phone, department, departments, role, password } = req.body;

    const depList = Array.isArray(departments) && departments.length > 0
      ? departments
      : (department ? [department] : []);

    if (!name || !email || depList.length === 0 || !role) {
      return res.status(400).json({
        success: false,
        message: "All fields are required including at least one department",
      });
    }

    const existingUser = await UserData.findOne({ email });

    if (existingUser) {
      const currentDeps = (existingUser.departments || []).map((d) => d.toString());
      if (existingUser.department && !currentDeps.includes(existingUser.department.toString())) {
        currentDeps.push(existingUser.department.toString());
      }

      let updated = false;
      depList.forEach((depId) => {
        if (depId && !currentDeps.includes(depId.toString())) {
          currentDeps.push(depId.toString());
          updated = true;
        }
      });

      if (updated) {
        existingUser.departments = currentDeps;
        if (!existingUser.department && currentDeps.length > 0) {
          existingUser.department = currentDeps[0];
        }
        await existingUser.save();

        const adminName = req.admin ? (req.admin.name || req.admin.email) : "System Admin";
        await logActivity(
          "User Updated",
          `Department association updated for user ${existingUser.name} (${existingUser.email}) by ${adminName}.`,
          adminName,
          req.admin?._id,
          true
        );

        return res.status(200).json({
          success: true,
          message: `Department association(s) updated for existing account (${existingUser.name}).`,
          user: existingUser,
        });
      } else {
        return res.status(200).json({
          success: true,
          message: `User (${existingUser.name}) is already assigned to the selected department(s).`,
          user: existingUser,
        });
      }
    }

    const plainPassword =
      password && password.trim()
        ? password
        : Math.random().toString(36).slice(-8);

    const newUser = await UserData.create({
      name,
      email,
      password: plainPassword,
      phone,
      department: depList[0],
      departments: depList,
      role,
    });

    const adminName = req.admin ? (req.admin.name || req.admin.email) : "System Admin";

    let activityTitle = "New User Created";
    if (role.toLowerCase() === "student") activityTitle = "Student Created";
    if (role.toLowerCase() === "professor") activityTitle = "Professor Created";

    await logActivity(
      activityTitle,
      `New user ${name} was created by ${adminName}.`,
      adminName,
      req.admin?._id,
      true
    );

    // Send Welcome Email (Requirement 12)
    await sendWelcomeEmail(name, email, plainPassword);

    let summaryText =
      role.toLowerCase() === "student"
        ? "You can upload assignments, view submission status, and track approval or rejection from professors."
        : "You can review student assignments, approve or reject submissions, and monitor overall progress.";

    let messageHTML = `
      <div style="font-family:sans-serif;color:#333;max-width:600px;border:1px solid #eee;padding:20px;border-radius:10px;">
        <h2 style="color:#4b6cb7;">Welcome to University Portal</h2>
        <p>Hello <b>${name}</b>,</p>
        <p>Your account has been created successfully.</p>
        <div style="background:#f4f7fe;padding:15px;border-radius:8px;margin:20px 0;">
          <p><b>Email:</b> ${email}</p>
          <p><b>Password:</b> ${plainPassword}</p>
        </div>
        <p><b>Dashboard Summary:</b></p>
        <p>${summaryText}</p>
      </div>
    `;

    await Notification.create({
      userId: newUser._id,
      title: "University Account Created",
      message: messageHTML,
    });

    res.status(201).json({
      success: true,
      message: "User created successfully and email sent!",
      user: newUser,
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: "Error creating user",
    });

  }
});


// =======================
// GET ALL USERS
// =======================
router.get("/admin/users", verifyAdmin, async (req, res) => {
  try {

    const users = await UserData.find()
      .sort({ createdAt: -1 })
      .populate("department", "name")
      .populate("departments", "name")
      .lean();

    res.json({
      success: true,
      users,
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: "Error fetching users",
    });

  }
});


// =======================
// GET SINGLE USER
// =======================
router.get("/admin/users/:id", verifyAdmin, async (req, res) => {
  try {

    const user = await UserData.findById(req.params.id)
      .populate("department", "name")
      .populate("departments", "name")
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user,
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });

  }
});


// =======================
// UPDATE USER
// =======================
router.put("/admin/users/:id", verifyAdmin, async (req, res) => {
  try {

    const { name, email, department, departments, role, password, phone } = req.body;

    const user = await UserData.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const updatedFieldsList = [];
    let newPasswordSet = null;

    if (name && user.name !== name) {
      updatedFieldsList.push(`Name: ${user.name} ➔ ${name}`);
      user.name = name;
    }
    if (email && user.email !== email) {
      updatedFieldsList.push(`Email: ${user.email} ➔ ${email}`);
      user.email = email;
    }

    // Handle multi-department or single department update
    if (departments && Array.isArray(departments) && departments.length > 0) {
      updatedFieldsList.push(`Departments updated`);
      user.departments = departments;
      user.department = departments[0];
    } else if (department && String(user.department) !== String(department)) {
      updatedFieldsList.push(`Department updated`);
      user.department = department;
      user.departments = [department];
    }

    if (role && user.role !== role) {
      updatedFieldsList.push(`Role: ${user.role} ➔ ${role}`);
      user.role = role;
    }
    if (phone !== undefined && user.phone !== phone) {
      updatedFieldsList.push(`Phone number updated`);
      user.phone = phone;
    }

    if (password && password.trim() !== "") {
      updatedFieldsList.push(`Password changed`);
      newPasswordSet = password;
      user.password = password;
    }

    await user.save();

    const adminName = req.admin ? (req.admin.name || req.admin.email) : "System Admin";

    if (newPasswordSet) {
      await logActivity(
        "Password Changed",
        `Password for user ${user.name} was changed by ${adminName}.`,
        adminName,
        req.admin?._id,
        true
      );
    } else {
      await logActivity(
        "User Updated",
        `User ${user.name} was updated by ${adminName}.`,
        adminName,
        req.admin?._id,
        true
      );
    }

    // Automatically send notification email (Requirement 11)
    if (updatedFieldsList.length > 0) {
      sendAdminUserUpdateEmail(user.name, user.email, updatedFieldsList, !!newPasswordSet)
        .catch(err => console.error("Update email background err:", err));
    }

    res.json({
      success: true,
      message: "User updated successfully",
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: "Error updating user",
    });

  }
});


// =======================
// DELETE USER
// =======================
router.delete("/admin/users/:id", verifyAdmin, async (req, res) => {
  try {

    const user = await UserData.findById(req.params.id);
    if (user) {
      const adminName = req.admin ? (req.admin.name || req.admin.email) : "System Admin";
      await logActivity("User Deleted", `User ${user.name} was deleted by ${adminName}.`, adminName, req.admin?._id, true);
      await UserData.findByIdAndDelete(req.params.id);
    }

    res.json({
      success: true,
      message: "User deleted successfully",
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: "Error deleting user",
    });

  }
});

module.exports = router;
