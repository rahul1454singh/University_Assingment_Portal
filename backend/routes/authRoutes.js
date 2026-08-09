const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const Admin = require("../models/Admin");
const UserData = require("../models/UserData");

const router = express.Router();


function redirectByRole(role) {

  if (!role) return "/";

  const lower = role.toString().toLowerCase();

  switch (lower) {

    case "student":
      return "/student/dashboard";

    case "admin":
    case "administrator":
      return "/admin/dashboard";

    case "professor":
      return "/professor/dashboard";

    case "hod":
    case "head":
      return "/hod/dashboard";

    default:
      return "/";
  }
}


/* =====================================================
    Mail transporter
===================================================== */

const transporter = nodemailer.createTransport({

  host: process.env.SMTP_HOST || "smtp.gmail.com",

  port: Number(process.env.SMTP_PORT) || 587,

  secure: false,

  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },

  tls: {
    rejectUnauthorized: false,
    minVersion: "TLSv1.2"
  }

});



router.get("/", (req, res) => {
  res.redirect("/login");
});



/* ================= LOGIN API FOR REACT ================= */


router.post("/login", async (req, res) => {

  try {

    const { email, password } = req.body;


    // Check User

    const user = await UserData.findOne({ email });


    if (user) {


      const ok = await bcrypt.compare(password, user.password);


      if (!ok) {

        return res.status(401).json({

          success:false,

          message:"Invalid email or password"

        });

      }



      const token = jwt.sign(

        {
          id:user._id,

          role:user.role

        },

        process.env.JWT_SECRET,

        {
          expiresIn:"2h"
        }

      );



      res.cookie("token", token, {

        httpOnly:true,

        sameSite:"lax"

      });



      return res.json({

        success:true,

        role:user.role,

        user:{
          name:user.name || user.fullName,
          email:user.email,
          role:user.role
        },

        redirect:redirectByRole(user.role)

      });


    }
        // Check Admin


    const admin = await Admin.findOne({ email });

    if (admin) {

      const ok = await bcrypt.compare(password, admin.password);



      if (!ok) {

        return res.status(401).json({

          success:false,

          message:"Invalid email or password"

        });

      }



      const token = jwt.sign(

        {

          id:admin._id,

          role:admin.role || "admin"

        },

        process.env.JWT_SECRET,

        {

          expiresIn:"2h"

        }

      );




      res.cookie("token", token, {

        httpOnly:true,

        sameSite:"lax"

      });




      return res.json({

        success:true,

        role:admin.role || "admin",

        user:{
          name:admin.name,
          email:admin.email,
          role:admin.role || "admin"
        },

        redirect:redirectByRole(admin.role || "admin")

      });


    }




    return res.status(401).json({

      success:false,

      message:"Invalid email or password"

    });



  } catch(err) {


    console.error(err);


    return res.status(500).json({

      success:false,

      message:"Server error"

    });


  }

});

/* ================= LOGOUT ================= */


router.post("/logout",(req,res)=>{

  res.clearCookie("token");

  return res.json({

    success:true

  });

});


router.get("/logout",(req,res)=>{

  res.clearCookie("token");

  return res.redirect("/login");

});

/* ================= GET CURRENT LOGGED IN USER ================= */
router.get("/api/auth/me", async (req, res) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (!payload || !payload.id) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    let userObj = null;
    if (payload.role?.toLowerCase() === "admin") {
      userObj = await Admin.findById(payload.id).lean();
    } else {
      userObj = await UserData.findById(payload.id).lean();
    }

    if (!userObj) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.json({
      success: true,
      user: {
        id: userObj._id,
        name: userObj.name || userObj.fullName || "User",
        email: userObj.email,
        role: userObj.role || payload.role,
        profileImage: userObj.profileImage || "",
        phone: userObj.phone || ""
      }
    });
  } catch (err) {
    return res.status(401).json({ success: false, message: "Session expired" });
  }
});


const { sendOtpEmail } = require("../utils/emailService");
const { logActivity } = require("../utils/activityLogger");

// ================= FORGOT PASSWORD (OTP SYSTEM) =================


router.get("/forgot-password", (req, res) => {

  res.render("forgot-password", {
    error:null,
    success:null
  });

});


const handleForgotPassword = async (req, res) => {
  const isJson = req.xhr || req.headers.accept?.includes("application/json") || req.path.startsWith("/api");
  try {
    const { email } = req.body;
    if (!email) {
      if (isJson) return res.status(400).json({ success: false, message: "Email is required" });
      return res.render("forgot-password", { error: "Email is required", success: null });
    }

    let account =
      await UserData.findOne({ email }) ||
      await Admin.findOne({ email });

    if (!account) {
      if (isJson) return res.status(404).json({ success: false, message: "No account found with this email." });
      return res.render("forgot-password", {
        error: "No account found with this email.",
        success: null
      });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    account.resetPasswordToken = otp;
    account.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes validity

    await account.save();

    await sendOtpEmail(account.email, otp);
    await logActivity("Password Reset Requested", `OTP requested for user account (${account.email}).`, account.name || account.email);

    if (isJson) {
      return res.json({
        success: true,
        message: "OTP sent successfully to your email!",
        email
      });
    }

    return res.render("verify-otp", {
      email,
      error: null,
      success: "OTP sent successfully!"
    });
  } catch (err) {
    console.error(err);
    if (isJson) return res.status(500).json({ success: false, message: "Something went wrong." });
    return res.render("forgot-password", {
      error: "Something went wrong.",
      success: null
    });
  }
};

router.post("/forgot-password", handleForgotPassword);
router.post("/api/forgot-password", handleForgotPassword);


const handleVerifyOtp = async (req, res) => {
  const isJson = req.xhr || req.headers.accept?.includes("application/json") || req.path.startsWith("/api");
  try {
    const { email, otp } = req.body;

    let account =
      await UserData.findOne({
        email,
        resetPasswordToken: otp,
        resetPasswordExpires: { $gt: Date.now() }
      }) ||
      await Admin.findOne({
        email,
        resetPasswordToken: otp,
        resetPasswordExpires: { $gt: Date.now() }
      });

    if (!account) {
      if (isJson) return res.status(400).json({ success: false, message: "Invalid or expired OTP." });
      return res.render("verify-otp", {
        email,
        error: "Invalid or expired OTP.",
        success: null
      });
    }

    if (isJson) {
      return res.json({
        success: true,
        message: "OTP verified successfully!",
        email
      });
    }

    return res.render("reset-password", {
      error: null,
      success: null,
      email
    });
  } catch (err) {
    if (isJson) return res.status(500).json({ success: false, message: "Error verifying OTP." });
    res.redirect("/forgot-password");
  }
};

router.post("/verify-otp", handleVerifyOtp);
router.post("/api/verify-otp", handleVerifyOtp);


const handleResetPassword = async (req, res) => {
  const isJson = req.xhr || req.headers.accept?.includes("application/json") || req.path.startsWith("/api");
  try {
    const { email, password } = req.body;

    let account =
      await UserData.findOne({ email }) ||
      await Admin.findOne({ email });

    if (!account) {
      if (isJson) return res.status(400).json({ success: false, message: "Session expired or user not found." });
      return res.render("reset-password", {
        error: "Session expired.",
        success: null,
        email: null
      });
    }

    account.password = password;
    account.resetPasswordToken = undefined;
    account.resetPasswordExpires = undefined;

    await account.save();

    await logActivity("Password Changed", `Password changed for account (${account.email}).`, account.name || account.email);

    if (isJson) {
      return res.json({
        success: true,
        message: "Your password has been changed successfully."
      });
    }

    return res.render("reset-password", {
      error: null,
      success: "Your password has been changed successfully.",
      email: null
    });
  } catch (err) {
    console.error(err);
    if (isJson) return res.status(500).json({ success: false, message: "Error resetting password." });
    return res.render("reset-password", {
      error: "Error resetting password.",
      success: null,
      email: req.body.email
    });
  }
};

router.post("/reset-password", handleResetPassword);
router.post("/api/reset-password", handleResetPassword);


const handleResendOtp = async (req, res) => {
  const isJson = req.xhr || req.headers.accept?.includes("application/json") || req.path.startsWith("/api");
  try {
    const { email } = req.body;

    let account =
      await UserData.findOne({ email }) ||
      await Admin.findOne({ email });

    if (!account) {
      if (isJson) return res.status(404).json({ success: false, message: "Account not found" });
      return res.redirect("/forgot-password");
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    account.resetPasswordToken = otp;
    account.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes validity

    await account.save();

    await sendOtpEmail(account.email, otp);

    if (isJson) {
      return res.json({
        success: true,
        message: "A new OTP has been sent to your email.",
        email
      });
    }

    return res.render("verify-otp", {
      email,
      error: null,
      success: "A new OTP has been sent to your email."
    });
  } catch (err) {
    console.error(err);
    if (isJson) return res.status(500).json({ success: false, message: "Failed to resend OTP." });
    res.redirect("/forgot-password");
  }
};

router.post("/resend-otp", handleResendOtp);
router.post("/api/resend-otp", handleResendOtp);

module.exports = router;
