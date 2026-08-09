const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserDataSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true
  },

  phone: {
    type: String
  },

  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department"
  },

  departments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department"
  }],

  isOnline: {
    type: Boolean,
    default: false
  },

  lastSeen: {
    type: Date,
    default: Date.now
  },

  role: {
    type: String,
    enum: ["student", "professor", "hod"],
    lowercase: true,
    default: "student"
  },


  // =========================
  // PROFILE IMAGE
  // Cloudinary image URL
  // =========================

  profileImage: {
    type: String,
    default: ""
  },


  // Password Reset

  resetPasswordToken: {
    type: String
  },

  resetPasswordExpires: {
    type: Date
  },


  createdAt: {
    type: Date,
    default: Date.now
  }

});


// ==========================================
// AUTO HASH PASSWORD BEFORE SAVE
// ==========================================

UserDataSchema.pre("save", async function(next){

  if (!this.isModified("password")) {
    return next();
  }


  try {

    const salt = await bcrypt.genSalt(10);

    this.password = await bcrypt.hash(
      this.password,
      salt
    );

    next();

  } catch(err){

    next(err);

  }

});


module.exports =
mongoose.models.UserData ||
mongoose.model("UserData", UserDataSchema);