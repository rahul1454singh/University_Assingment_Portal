const Assignment = require("../models/Assignment");
const cloudinary = require("../config/cloudinary");




// show upload form
exports.getUploadForm = (req, res) => {

  res.render(
    "upload-assignment",
    {
      error:null,
      success:null,
      assignmentId:null
    }
  );

};






// handle upload

exports.uploadAssignment = async (req, res) => {


  try {



    // Check PDF

    if(!req.file){


      return res.status(400).render(
        "upload-assignment",
        {
          error:"Please upload a PDF file (max 10MB).",
          success:null,
          assignmentId:null
        }
      );


    }







    const {
      title,
      description,
      category,
      professor

    } = req.body;








    if(!title || !category || !professor){


      return res.status(400).render(

        "upload-assignment",

        {
          error:"Title, Category and Professor are required.",
          success:null,
          assignmentId:null
        }

      );


    }









    // Logged in student ID

    const userId =
      (req.user && req.user._id)
      ?
      req.user._id
      :
      req.body.userId;






    if(!userId){


      return res.status(401).render(

        "upload-assignment",

        {
          error:"User not authenticated. Please login.",
          success:null,
          assignmentId:null
        }

      );


    }










    // =====================================
    // CLOUDINARY UPLOAD
    // =====================================


    const uploadResult = await cloudinary.uploader.upload(

      req.file.path,

      {

        folder:

        `University_Management_System/students/${userId}/assignments`,


        resource_type:"raw",


        public_id:

        req.file.originalname.replace(".pdf","")


      }

    );









    // =====================================
    // SAVE ASSIGNMENT
    // =====================================


    const newAssignment = new Assignment({


      title,


      description,


      user:userId,


      professor,


      status:"Draft",




      file:{


        filename:req.file.filename,


        originalname:req.file.originalname,


        url:uploadResult.secure_url,


        public_id:uploadResult.public_id,


        size:req.file.size,


        mimetype:req.file.mimetype


      },



      category



    });









    const saved = await newAssignment.save();









    return res.render(

      "upload-assignment",

      {

        error:null,

        success:"Uploaded successfully",

        assignmentId:saved._id

      }

    );







  } catch(err){



    console.error(
      "Upload error:",
      err
    );



    let message =
    "Server error while uploading.";






    if(
      err.message &&
      err.message.includes("Only PDF")
    ){

      message =
      "Only PDF files are allowed.";

    }







    if(
      err.code === "LIMIT_FILE_SIZE"
    ){

      message =
      "File too large. Maximum 10MB allowed.";

    }







    return res.status(500).render(

      "upload-assignment",

      {

        error:message,

        success:null,

        assignmentId:null

      }

    );


  }


};