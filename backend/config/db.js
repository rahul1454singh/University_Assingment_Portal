// config/db.js
const dns = require("dns");
const mongoose = require("mongoose");

// Fix for Windows / ISP DNS issues resolving MongoDB Atlas SRV records (Windows only)
if (process.platform === "win32") {
  try {
    dns.setServers(["8.8.8.8", "8.8.4.4"]);
  } catch (e) {}
}

const DEFAULT_LOCAL_URI = "mongodb://127.0.0.1:27017/universityDB";

async function connectDB({ retries = 3, retryDelayMs = 2000 } = {}) {
  // If already connected, reuse existing connection (crucial for Vercel serverless)
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  // ✅ Detect production by presence of MONGO_URI
  const isProduction = !!process.env.MONGO_URI;

  const uri = isProduction
    ? process.env.MONGO_URI
    : DEFAULT_LOCAL_URI;

  if (!uri) {
    console.error("❌ MONGO_URI is required in production");
    throw new Error("Missing MONGO_URI");
  }

  if (!isProduction) {
    console.warn("⚠️ MONGO_URI not found — using local DB:", uri);
  }

  const options = {
    serverSelectionTimeoutMS: 8000
  };

  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      await mongoose.connect(uri, options);
      console.log("✅ MongoDB Connected");

      /* ===================== DATA CLEANUP FIX ===================== */
      // This specifically fixes the "Student" vs "student" enum error
      const UserData = mongoose.model("UserData");
      if (UserData) {
        await UserData.updateMany({ role: "Student" }, { $set: { role: "student" } });
        await UserData.updateMany({ role: "Professor" }, { $set: { role: "professor" } });
        await UserData.updateMany({ role: "Hod" }, { $set: { role: "hod" } });
      }
      /* ============================================================= */

      // SAFE connection events (NO shutdown)
      mongoose.connection.on("error", err => {
        console.error("Mongo Error:", err);
      });

      mongoose.connection.on("disconnected", () => {
        console.warn("⚠️ Mongo Disconnected");
      });

      return; // ✅ success
    } catch (err) {
      console.error(
        `DB Error (attempt ${attempt}/${retries + 1}):`,
        err.message || err
      );

      if (attempt > retries) {
        throw err;
      }

      console.log(`Retrying in ${retryDelayMs}ms...`);
      await new Promise(r => setTimeout(r, retryDelayMs));
    }
  }
}

module.exports = connectDB;
