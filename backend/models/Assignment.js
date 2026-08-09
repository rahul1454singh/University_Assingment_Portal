const mongoose = require("mongoose");


const AssignmentSchema = new mongoose.Schema({

  title: { 
    type: String, 
    required: true 
  },


  description: { 
    type: String 
  },


  user: { 

    type: mongoose.Schema.Types.ObjectId, 

    ref: "UserData", 

    required: true, 

    index: true 

  },


  // =====================================
  // ASSIGNED PROFESSOR
  // =====================================

  professor: {

    type: mongoose.Schema.Types.ObjectId,

    ref: "UserData",

    required: true,

    index: true

  },



  status: { 

    type: String, 

    enum: ["Draft", "Submitted", "Approved", "Rejected"], 

    default: "Draft" 

  },



  category: { 

    type: String, 

    enum: ["Assignment", "Thesis", "Report"], 

    default: "Assignment", 

    required: true 

  },




  // =====================================
  // CLOUDINARY FILE STORAGE
  // =====================================


  file: {


    filename: String,


    originalname: String,


    url: String,


    public_id: String,


    size: Number,


    mimetype: String


  },




  reviewerId: { 

    type: mongoose.Schema.Types.ObjectId, 

    ref: "UserData", 

    default: null 

  },



  reviewerName: { 

    type: String, 

    default: "" 

  },



  submittedAt: { 

    type: Date, 

    default: null 

  },



  studentMessage: { 

    type: String, 

    default: "" 

  },




  // =====================================
  // REJECTION REMARKS
  // =====================================


  rejectionRemarks: { 

    type: String, 

    default: "" 

  },





  // =====================================
  // ASSIGNMENT HISTORY
  // OLD FILES ALSO STORED IN CLOUDINARY
  // =====================================


  history: [

    {


      file: {


        filename: String,


        originalname: String,


        url: String,


        public_id: String,


        size: Number,


        mimetype: String


      },


      description: String,


      submittedAt: Date


    }

  ]



}, 

{ 

  timestamps: true 

});





AssignmentSchema.index({ createdAt: -1 });





module.exports =

mongoose.models.Assignment ||

mongoose.model("Assignment", AssignmentSchema);