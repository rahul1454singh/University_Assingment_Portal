// ======================================================
// STUDENT ROUTES
// UNIVERSITY MANAGEMENT SYSTEM
//
// Handles:
// - Student Profile
// - Assignment Upload
// - Cloudinary Storage
// - Assignment Management
// ======================================================



const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");



const { verifyStudent } = require("../middleware/authMiddleware");

const { uploadProfile } = require("../middleware/cloudinaryUpload");

const cloudinary = require("../config/cloudinary");

const Assignment = require("../models/Assignment");

const User = require("../models/UserData");





const router = express.Router();







// ======================================================
// CLOUDINARY ASSIGNMENT STORAGE HELPER
//
// Folder Structure:
//
// University_Management_System
//        |
//        students
//             |
//             studentId
//                    |
//                    assignments
//
// Example:
//
// students/64abc123/assignments/file.pdf
//
// ======================================================


const uploadAssignmentToCloudinary = async (file, studentId) => {
  try {
    const rawName = file.originalname || "document.pdf";
    const cleanName = path.parse(rawName).name.replace(/[^a-zA-Z0-9_-]/g, "_");
    const publicId = `${Date.now()}_${cleanName}`;

    let result;
    try {
      result = await cloudinary.uploader.upload(file.path, {
        folder: `University_Management_System/students/${studentId}/assignments`,
        resource_type: "raw",
        public_id: `${publicId}.pdf`
      });
    } catch (rawErr) {
      result = await cloudinary.uploader.upload(file.path, {
        folder: `University_Management_System/students/${studentId}/assignments`,
        resource_type: "auto",
        public_id: publicId
      });
    }
    return result;
  } catch (err) {
    console.error("Cloudinary assignment upload error:", err);
    throw err;
  } finally {
    if (file && file.path && fs.existsSync(file.path)) {
      try {
        fs.unlinkSync(file.path);
      } catch (cleanupErr) {
        // silent
      }
    }
  }
};









// ======================================================
// MULTER PDF UPLOAD CONFIGURATION
//
// Purpose:
// Temporary storage before Cloudinary upload
//
// Rules:
// - PDF only
// - Maximum 10MB
//
// ======================================================



const os = require("os");

const uploadDir = os.tmpdir();








const storage = multer.diskStorage({


  destination:(req,file,cb)=>{


    cb(

      null,

      uploadDir

    );


  },



  filename:(req,file,cb)=>{


    const safeName =

    file.originalname.replace(/\s+/g,"_");



    cb(

      null,

      `${Date.now()}_${safeName}`

    );


  }


});








// ======================================================
// PDF FILE FILTER
// ======================================================


function fileFilter(req,file,cb){


  if(file.mimetype === "application/pdf"){


    cb(null,true);


  }

  else{


    cb(

      new Error("Only PDF files allowed"),

      false

    );


  }


}









// ======================================================
// MULTER INSTANCE
// Used by:
// - Single Upload
// - React Upload
// - Edit Upload
// - Bulk Upload
// ======================================================



const upload = multer({


  storage,



  limits:{


    fileSize:10 * 1024 * 1024


  },



  fileFilter



});

// ======================================================
// DASHBOARD API FOR REACT
// ======================================================

router.get("/api/student/dashboard", verifyStudent, async (req, res) => {
  try {

    const userId = req.user._id;

    const agg = await Assignment.aggregate([
      { $match: { user: userId } },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    const counts = {
      Draft: 0,
      Submitted: 0,
      Approved: 0,
      Rejected: 0
    };

    agg.forEach(item => {
      counts[item._id] = item.count;
    });

    const recent = await Assignment.find({
      user: userId
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();


    res.json({
      success: true,
      counts,
      recent,
      user: req.user
    });


  } catch (err) {

    console.error(err);

    res.status(500).json({
      success:false,
      message:"Server Error"
    });

  }
});






// ======================================================
// PROFILE PAGE
// ======================================================

router.get("/student/profile", verifyStudent, async (req,res)=>{

  const user = await User.findById(req.user._id)
    .populate("department")
    .lean();


  res.render("student-profile",{
    user
  });

});







// ======================================================
// UPDATE STUDENT PROFILE API
// Phone + Password
const { logActivity } = require("../utils/activityLogger");

router.put(
  "/api/student/profile/update",
  verifyStudent,
  async(req,res)=>{

    try{

      const {
        phone,
        password
      } = req.body;


      const user = await User.findById(
        req.user._id
      );


      if(!user){

        return res.status(404).json({
          success:false,
          message:"User not found"
        });

      }


      if(phone !== undefined){

        user.phone = phone;

      }


      if(password){

        user.password = password;
        await logActivity("Password Changed", `Student ${user.name} changed their account password.`, user.name, user._id, false);

      }


      await user.save();
      await logActivity("Profile Updated", `Student ${user.name} updated profile details.`, user.name, user._id, false);


      res.json({
        success:true,
        message:"Profile updated successfully"
      });


    }catch(error){

      console.error("Update profile error:", error);

      res.status(500).json({
        success:false,
        message:"Server error"
      });

    }

  }
);









// ======================================================
// PROFILE IMAGE UPLOAD
// Cloudinary
//
// Folder:
// students/{studentId}/profile
// ======================================================


router.post(
  "/api/student/profile/upload-image",
  verifyStudent,
  uploadProfile.single("profileImage"),
  async(req,res)=>{

    try{

      if(!req.file){

        return res.status(400).json({
          success:false,
          message:"Please select an image"
        });

      }


      const user = await User.findById(
        req.user._id
      );


      if(!user){

        return res.status(404).json({
          success:false,
          message:"User not found"
        });

      }


      user.profileImage = req.file.path;


      await user.save();


      res.json({
        success:true,
        message:"Profile image uploaded successfully",
        profileImage:user.profileImage
      });


    }catch(error){

      console.error(error);

      res.status(500).json({
        success:false,
        message:"Failed to upload profile image"
      });

    }

  }
);








// ======================================================
// PROFILE API FOR REACT
// ======================================================


router.get(
  "/api/student/profile",
  verifyStudent,
  async(req,res)=>{

    try{

      const user = await User.findById(
        req.user._id
      )
      .populate("department", "name")
      .populate("departments", "name")
      .lean();

      let depNames = [];
      if (Array.isArray(user.departments) && user.departments.length > 0) {
        depNames = user.departments.map(d => d.name).filter(Boolean);
      }
      if (depNames.length === 0 && user.department && user.department.name) {
        depNames.push(user.department.name);
      }

      res.json({

        success:true,

        user:{
          name:user.name,
          email:user.email,
          phone:user.phone,
          role:user.role,
          profileImage:user.profileImage || "",
          department:depNames.join(", ") || user.department?.name || "General",
          departments: depNames
        }

      });


    }catch(err){

      console.error(err);

      res.status(500).json({
        success:false,
        message:"Server Error"
      });

    }

  }
);


// ======================================================
// ASSIGNMENT LIST
// ======================================================

router.get("/student/assignments", verifyStudent, async(req,res)=>{

  const assignments = await Assignment.find({
    user:req.user._id
  })
  .sort({createdAt:-1})
  .lean();


  res.render("assignments-list",{
    assignments,
    user:req.user
  });

});





// ======================================================
// ASSIGNMENT LIST API FOR REACT
// ======================================================

router.get(
  "/api/student/assignments",
  verifyStudent,
  async(req,res)=>{

    try{

      const assignments = await Assignment.find({
        user:req.user._id
      })
      .sort({createdAt:-1})
      .lean();


      res.json({
        success:true,
        assignments
      });


    }catch(err){

      console.error(err);

      res.status(500).json({
        success:false,
        message:"Server Error"
      });

    }

  }
);







// ======================================================
// UPLOAD ASSIGNMENT PAGE
// ======================================================

router.get(
  "/student/assignments/upload",
  verifyStudent,
  async(req,res)=>{


    let professors = await User.find({
      role:{
        $regex:/^professor$/i
      },
      department:req.user.department
    })
    .select("_id name fullName")
    .lean();



    if(!professors.length){

      professors = await User.find({
        role:{
          $regex:/^professor$/i
        }
      })
      .select("_id name fullName")
      .lean();

    }



    res.render("upload-assignment",{

      error:null,

      success:null,

      professors,

      user:req.user

    });


  }
);









// ======================================================
// SINGLE ASSIGNMENT UPLOAD
//
// Cloudinary Folder:
//
// University_Management_System
//        students
//             studentId
//                  assignments
//
// ======================================================


router.post(
  "/student/assignments/upload",
  verifyStudent,
  upload.single("file"),
  async(req,res)=>{


    try{


      let professors = await User.find({
        role:{
          $regex:/^professor$/i
        }
      })
      .select("_id name fullName")
      .lean();




      if(!req.file){


        return res.render(
          "upload-assignment",
          {

            error:"Upload PDF file",

            success:null,

            professors,

            user:req.user

          }
        );


      }






      // Upload PDF to Cloudinary

      const uploadResult =
      await uploadAssignmentToCloudinary(
        req.file,
        req.user._id
      );







const assignment = new Assignment({
  title:req.body.title,
  description:req.body.description,
  category:req.body.category,
  professor:req.body.professor,
  reviewerId:req.body.professor,
  user:req.user._id,
  status:"Draft",



        file:{


          filename:req.file.filename,


          originalname:req.file.originalname,


          url:uploadResult.secure_url,


          public_id:uploadResult.public_id,


          size:req.file.size,


          mimetype:req.file.mimetype


        }


      });







      await assignment.save();







      res.render(
        "upload-assignment",
        {

          success:"Uploaded successfully",

          error:null,

          professors,

          user:req.user

        }
      );



    }catch(err){


      console.error(
        "Assignment upload error:",
        err
      );


      res.status(500).render(
        "upload-assignment",
        {

          error:"Server error while uploading",

          success:null

        }
      );


    }


  }
);

// ======================================================
// REACT SINGLE ASSIGNMENT UPLOAD API
//
// Frontend:
// StudentAssignmentUpload.jsx
//
// API:
// POST /api/student/assignments/upload
//
// Cloudinary Folder:
// students/{studentId}/assignments
// ======================================================


router.post(
  "/api/student/assignments/upload",
  verifyStudent,
  upload.single("file"),
  async(req,res)=>{


    try{

      if(!req.file){


        return res.status(400).json({

          success:false,

          message:"Please select a PDF file."

        });


      }






      // Upload PDF to Cloudinary

      const uploadResult =
      await uploadAssignmentToCloudinary(

        req.file,

        req.user._id

      );








      const assignment = new Assignment({


         title:req.body.title,

  description:req.body.description,

  category:req.body.category,

  professor:req.body.professor,
  professor:req.body.professor,

  reviewerId:req.body.professor,

  user:req.user._id,

  status:"Draft",





        file:{


          filename:req.file.filename,


          originalname:req.file.originalname,


          url:uploadResult.secure_url,


          public_id:uploadResult.public_id,


          size:req.file.size,


          mimetype:req.file.mimetype


        }



      });







      await assignment.save();







      res.json({


        success:true,


        message:"Assignment uploaded successfully",


        assignment



      });







    }catch(err){



      console.error(

        "React assignment upload error:",

        err

      );



      res.status(500).json({


        success:false,


        message:"Server Error"



      });



    }


  }

);
// ======================================================
// EDIT ASSIGNMENT API
//
// GET /api/student/assignments/:id/edit
// PUT /api/student/assignments/:id/edit
// ======================================================

router.get(
  "/api/student/assignments/:id/edit",
  verifyStudent,
  async (req, res) => {
    try {
      const assignment = await Assignment.findOne({
        _id: req.params.id,
        user: req.user._id
      })
        .populate("reviewerId", "_id fullName name")
        .lean();

      if (!assignment) {
        return res.status(404).json({
          success: false,
          message: "Assignment not found."
        });
      }

      if (assignment.status !== "Draft" && assignment.status !== "Rejected") {
        return res.status(403).json({
          success: false,
          message: "Only Draft and Rejected assignments can be edited."
        });
      }

      let professors = await User.find({
        role: { $regex: /^professor$/i },
        department: req.user.department
      })
        .select("_id name fullName")
        .lean();

      if (!professors.length) {
        professors = await User.find({
          role: { $regex: /^professor$/i }
        })
          .select("_id name fullName")
          .lean();
      }

      res.json({
        success: true,
        assignment,
        professors
      });
    } catch (err) {
      console.error("Fetch assignment for edit error:", err);
      res.status(500).json({
        success: false,
        message: "Server error while fetching assignment details."
      });
    }
  }
);

router.put(
  "/api/student/assignments/:id/edit",
  verifyStudent,
  upload.single("file"),
  async (req, res) => {
    try {
      const assignment = await Assignment.findOne({
        _id: req.params.id,
        user: req.user._id
      });

      if (!assignment) {
        return res.status(404).json({
          success: false,
          message: "Assignment not found."
        });
      }

      if (assignment.status !== "Draft" && assignment.status !== "Rejected") {
        return res.status(403).json({
          success: false,
          message: "Only Draft and Rejected assignments can be edited."
        });
      }

      const { title, description, category, professor } = req.body;

      if (!title?.trim()) {
        return res.status(400).json({
          success: false,
          message: "Assignment title is required."
        });
      }

      if (!category) {
        return res.status(400).json({
          success: false,
          message: "Category is required."
        });
      }

      if (!professor) {
        return res.status(400).json({
          success: false,
          message: "Please select a professor."
        });
      }

      assignment.title = title.trim();
      assignment.description = description?.trim() || "";
      assignment.category = category;
      assignment.reviewerId = professor;

      // If new PDF is selected, upload to Cloudinary and cleanup temp file
      if (req.file) {
        if (assignment.file?.public_id) {
          try {
            await cloudinary.uploader.destroy(assignment.file.public_id, {
              resource_type: "raw"
            });
          } catch (destroyErr) {
            console.error("Cloudinary destroy old file error:", destroyErr);
          }
        }

        const uploadResult = await uploadAssignmentToCloudinary(
          req.file,
          req.user._id
        );

        assignment.file = {
          filename: req.file.filename,
          originalname: req.file.originalname,
          url: uploadResult.secure_url,
          public_id: uploadResult.public_id,
          size: req.file.size,
          mimetype: req.file.mimetype
        };

        if (fs.existsSync(req.file.path)) {
          fs.unlink(req.file.path, () => {});
        }
      }

      await assignment.save();

      res.json({
        success: true,
        message: "Assignment updated successfully.",
        assignment
      });
    } catch (err) {
      console.error("Edit assignment error:", err);
      res.status(500).json({
        success: false,
        message: "Server Error"
      });
    }
  }
);

// ======================================================
// BULK UPLOAD PAGE
//
// Shows bulk upload form
// ======================================================


router.get(
  "/student/assignments/bulk-upload",
  verifyStudent,
  async(req,res)=>{


    let professors = await User.find({

      role:{
        $regex:/^professor$/i
      }

    })
    .select("_id name fullName")
    .lean();



    res.render(
      "bulk-upload",
      {

        professors,

        error:null,

        success:null,

        user:req.user

      }
    );


  }
);







// ======================================================
// BULK ASSIGNMENT UPLOAD
//
// API:
//
// POST /student/assignments/bulk-upload
//
// Field:
//
// files (multiple PDFs)
//
// Cloudinary:
//
// students/{studentId}/assignments
//
// ======================================================


const handleBulkAssignmentUpload = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please upload PDF files."
      });
    }

    const uploadedAssignments = [];

    for (const file of req.files) {
      const uploadResult = await uploadAssignmentToCloudinary(
        file,
        req.user._id
      );

      const assignment = await Assignment.create({
        title: req.body.title || file.originalname.replace(".pdf", ""),
        description: req.body.description || "",
        category: req.body.category || "Assignment",
        professor: req.body.professor || null,
        reviewerId: req.body.professor || null,
        user: req.user._id,
        status: "Draft",
        file: {
          filename: file.filename,
          originalname: file.originalname,
          url: uploadResult.secure_url,
          public_id: uploadResult.public_id,
          size: file.size,
          mimetype: file.mimetype
        }
      });

      uploadedAssignments.push(assignment);
    }

    res.json({
      success: true,
      message: `${uploadedAssignments.length} assignment(s) uploaded successfully`,
      assignments: uploadedAssignments
    });
  } catch (err) {
    console.error("Bulk upload error:", err);
    res.status(500).json({
      success: false,
      message: "Error processing bulk upload."
    });
  }
};

router.post(
  "/student/assignments/bulk-upload",
  verifyStudent,
  upload.array("files", 10),
  handleBulkAssignmentUpload
);

router.post(
  "/api/student/assignments/bulk-upload",
  verifyStudent,
  upload.array("files", 10),
  handleBulkAssignmentUpload
);
// ======================================================
// ASSIGNMENT DETAILS API FOR REACT
//
// GET:
// /api/student/assignments/:id
// ======================================================


router.get(
  "/api/student/assignments/:id",
  verifyStudent,
  async(req,res)=>{

    try{


      const assignment = await Assignment.findOne({
        _id:req.params.id,
        user:req.user._id
      })
      .populate(
        "reviewerId",
        "fullName name email phone"
      )
      .populate(
        "professor",
        "fullName name email phone"
      )
      .lean();





      if(!assignment){


        return res.status(404).json({

          success:false,

          message:"Assignment not found"

        });


      }







      assignment.professorName =

        assignment.reviewerId?.fullName ||

        assignment.reviewerId?.name ||

        "Not Assigned";








      res.json({

        success:true,

        assignment

      });






    }catch(err){


      console.error(err);



      res.status(500).json({

        success:false,

        message:"Server Error"

      });


    }


  }

);









// ======================================================
// SUBMIT ASSIGNMENT
//
// Changes:
// Draft / Rejected
//        ↓
// Submitted
// ======================================================


router.post(
  "/student/assignments/:id/submit",
  verifyStudent,
  async(req,res)=>{


    try{


      const {
        reviewerId
      } = req.body;





      const assignment = await Assignment.findOne({

        _id:req.params.id,

        user:req.user._id,

        status:{
          $in:[
            "Draft",
            "Rejected"
          ]
        }

      });







      if(!assignment){


        return res.json({

          success:false,

          message:"Assignment cannot be submitted"

        });


      }







      assignment.status =
      "Submitted";



      assignment.reviewerId =
      reviewerId;



      assignment.submittedAt =
      new Date();







      await assignment.save();







      res.json({

        success:true,

        message:"Assignment submitted successfully"

      });







    }catch(err){


      console.error(err);


      res.status(500).json({

        success:false,

        message:"Server Error"

      });


    }


  }

);









// ======================================================
// DELETE ASSIGNMENT
//
// Approved assignment cannot delete
// ======================================================


router.post(
  "/student/assignments/:id/delete",
  verifyStudent,
  async(req,res)=>{


    try{


      const assignment = await Assignment.findOne({

        _id:req.params.id,

        user:req.user._id

      });







      if(!assignment){


        return res.json({

          success:false,

          message:"Assignment not found"

        });


      }







      if(
        assignment.status === "Approved"
      ){


        return res.json({

          success:false,

          message:
          "Approved assignments cannot be deleted"

        });


      }







      await Assignment.deleteOne({

        _id:assignment._id

      });







      res.json({

        success:true,

        message:"Assignment deleted successfully"

      });







    }catch(err){


      console.error(err);


      res.status(500).json({

        success:false,

        message:"Server Error"

      });


    }


  }

);


// ======================================================
// PROFESSOR LIST API FOR REACT
// Used in StudentUploadAssignment.jsx
// ======================================================

router.get(
  "/api/student/professors",
  verifyStudent,
  async (req, res) => {

    try {

      const userDepIds = [];
      if (Array.isArray(req.user.departments) && req.user.departments.length > 0) {
        req.user.departments.forEach(d => userDepIds.push(typeof d === 'object' && d._id ? d._id.toString() : d.toString()));
      }
      if (req.user.department) {
        userDepIds.push(typeof req.user.department === 'object' && req.user.department._id ? req.user.department._id.toString() : req.user.department.toString());
      }
      
      const professors = await User.find({
        role: { $regex: /^professor$/i },
        $or: [
          { departments: { $in: userDepIds } },
          { department: { $in: userDepIds } }
        ]
      })
      .select("_id name fullName")
      .lean();


      res.json({
        success: true,
        professors
      });


    } catch (err) {

      console.error(
        "Professor fetch error:",
        err
      );


      res.status(500).json({
        success: false,
        message: "Failed to load professors"
      });

    }

  }
);




// ======================================================
// EXPORT ROUTER
// ======================================================


module.exports = router;