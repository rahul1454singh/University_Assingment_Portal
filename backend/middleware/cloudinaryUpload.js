const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");


const profileStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "Students/Profile",
    allowed_formats: ["jpg", "jpeg", "png"],
    resource_type: "image"
  }
});


const pdfStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "Students/Assignments",
    allowed_formats: ["pdf"],
    resource_type: "raw"
  }
});


const uploadProfile = multer({
  storage: profileStorage
});


const uploadPDF = multer({
  storage: pdfStorage
});


module.exports = {
  uploadProfile,
  uploadPDF
};