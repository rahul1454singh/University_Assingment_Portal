const multer = require("multer");
const os = require("os");



/* ============================================================
   TEMP STORAGE FOR CLOUDINARY UPLOAD
   File is stored temporarily before sending to Cloudinary
============================================================ */


const uploadDir = os.tmpdir();





/* ============================================================
   STORAGE CONFIG
============================================================ */


const storage = multer.diskStorage({

    destination: function (req, file, cb) {

        cb(null, uploadDir);

    },


    filename: function (req, file, cb) {


        const timestamp = Date.now();


        const safeName = file.originalname.replace(/\s+/g, "_");


        cb(

            null,

            `${timestamp}_${safeName}`

        );


    }


});








/* ============================================================
   PDF ONLY VALIDATION
============================================================ */


function fileFilter(req, file, cb) {


    if(file.mimetype === "application/pdf"){


        cb(null,true);


    }else{


        cb(

            new Error("Only PDF files are allowed"),

            false

        );


    }


}








/* ============================================================
   MULTER INSTANCE
============================================================ */


const upload = multer({

    storage,


    limits:{


        fileSize:10 * 1024 * 1024


    },


    fileFilter


});





module.exports = upload;