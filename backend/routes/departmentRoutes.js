// routes/departmentRoute.js
const express = require("express");
const { verifyAdmin } = require("../middleware/authMiddleware");
const Department = require("../models/Department");
const UserData = require("../models/UserData");
const { logActivity } = require("../utils/activityLogger");

const router = express.Router();


const buildFilter = (query) => {
  const { type, q } = query || {};
  const filter = {};
  if (type && type !== "") filter.type = type;
  if (q && q.trim() !== "") filter.name = { $regex: q.trim(), $options: "i" };
  return filter;
};

const attachUserCounts = async (departments) => {
  return Promise.all(
    departments.map(async (d) => {
      const userCount = await UserData.countDocuments({ department: d._id });
      return {
        _id: d._id,
        name: d.name,
        type: d.type,
        address: d.address,
        userCount
      };
    })
  );
};

const renderDepartmentsList = async (res, opts = {}) => {
  const { q = "", type = "", error = null } = opts;
  const filter = buildFilter({ q, type });
  const departments = await Department.find(filter).sort({ createdAt: -1 });
  const departmentsWithUserCount = await attachUserCounts(departments);
  return res.render("departments-list", {
    departments: departmentsWithUserCount,
    q,
    type,
    error
  });
};

/* Routes */

// show create page
router.get("/admin/departments/create", verifyAdmin, (req, res) => {
  res.render("create-department", { error: null, success: null });
});

// create department

router.post("/admin/departments", verifyAdmin, async (req, res) => {

    try {

        const { name, type, address } = req.body;

        if (!name || !type || !address) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const department = await Department.create({
            name,
            type,
            address
        });

        const adminName = req.admin ? (req.admin.name || req.admin.email) : "System Admin";
        await logActivity("New Department Created", `Department ${name} was created by ${adminName}.`, adminName, req.admin?._id, true);

        res.status(201).json({
            success: true,
            message: "Department created successfully",
            department
        });

    } catch (err) {

        console.error("Error creating department:", err);

        res.status(500).json({
            success: false,
            message: "Error creating department"
        });

    }

});

// list departments (supports ?q and ?type)
// React API - get departments
router.get("/admin/departments", verifyAdmin, async (req,res)=>{
  try {

    const filter = buildFilter({
      q:req.query.q || "",
      type:req.query.type || ""
    });


    const departments = await Department.find(filter)
      .sort({ createdAt: -1 });


    const departmentsWithUserCount =
      await attachUserCounts(departments);


    res.json({
      success:true,
      departments:departmentsWithUserCount
    });


  } catch(err){

    console.error("Error fetching departments:", err);

    res.status(500).json({
      success:false,
      message:"Error fetching departments"
    });

  }
});

// React API - Department Options
router.get("/admin/departments/options", verifyAdmin, async (req, res) => {

  try {

    const departments = await Department.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      departments
    });

  } catch (err) {

    console.error("Error fetching department options:", err);

    res.status(500).json({
      success: false,
      message: "Server Error"
    });

  }

});


// React API - Get Single Department
router.get("/admin/departments/:id", verifyAdmin, async (req, res) => {
  try {

    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found"
      });
    }

    res.json({
      success: true,
      department
    });

  } catch (err) {

    console.error("Error fetching department:", err);

    res.status(500).json({
      success: false,
      message: "Server Error"
    });

  }
});

// React API - Update Department
router.put("/admin/departments/:id", verifyAdmin, async (req, res) => {

  try {

    const { name, type, address } = req.body;

    if (!name || !type || !address) {

      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });

    }

    const department = await Department.findByIdAndUpdate(

      req.params.id,

      {
        name,
        type,
        address
      },

      {
        new: true
      }

    );

    if (!department) {

      return res.status(404).json({
        success: false,
        message: "Department not found"
      });

    }

    const adminName = req.admin ? (req.admin.name || req.admin.email) : "System Admin";
    await logActivity("Department Updated", `Department ${name} was updated by ${adminName}.`, adminName, req.admin?._id, true);

    res.json({

      success: true,
      message: "Department updated successfully",
      department

    });

  } catch (err) {

    console.error("Error updating department:", err);

    res.status(500).json({

      success: false,
      message: "Update failed"

    });

  }

});


// legacy server-side delete (re-renders with error when users exist)
router.get("/admin/departments/delete/:id", verifyAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const userCount = await UserData.countDocuments({ department: id });

    if (userCount > 0) {
      // show departments list with error
      return await renderDepartmentsList(res, { error: "Department has users and cannot be deleted." });
    }

    const deletedDep = await Department.findByIdAndDelete(id);
    if (deletedDep) {
      const adminName = req.admin ? (req.admin.name || req.admin.email) : "System Admin";
      await logActivity("Department Deleted", `Department ${deletedDep.name} was deleted by ${adminName}.`, adminName, req.admin?._id, true);
    }
    return res.redirect("/admin/departments");
  } catch (err) {
    console.error("GET delete department error:", err);
    return res.redirect("/admin/departments");
  }
});

// API DELETE 
router.delete("/admin/departments/:id", verifyAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ message: "Department id required" });

    const usersCount = await UserData.countDocuments({ department: id });
    if (usersCount > 0) {
      return res.status(400).json({ message: `Cannot delete department: ${usersCount} user(s) are associated.` });
    }

    const deleted = await Department.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Department not found" });

    const adminName = req.admin ? (req.admin.name || req.admin.email) : "System Admin";
    await logActivity("Department Deleted", `Department ${deleted.name} was deleted by ${adminName}.`, adminName, req.admin?._id, true);

    return res.json({ message: "Department deleted" });
  } catch (err) {
    console.error("DELETE department error:", err);
    return res.status(500).json({ message: "Server error while deleting department" });
  }
});

module.exports = router;

