// server.js
process.env.DOTENV_CONFIG_SILENT = "true";
require("dotenv").config();

const path = require("path");
const fs = require("fs");
const http = require("http");
const express = require("express");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const { Server } = require("socket.io");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const userRoutes = require("./routes/userRoutes");
const studentRoutes = require("./routes/studentRoutes");
const professorRoutes = require("./routes/professorRoutes");
const complaintRoutes = require("./routes/complaintRoutes");
const messageRoutes = require("./routes/messageRoutes");

const UserData = require("./models/UserData");
const Message = require("./models/Message");

/* ===================== DEPARTMENT ROUTE AUTO-DETECT ===================== */

let departmentRoutes;
const dRoute1 = path.join(__dirname, "routes", "departmentRoute.js");
const dRoute2 = path.join(__dirname, "routes", "departmentRoutes.js");

if (fs.existsSync(dRoute1)) {
  departmentRoutes = require("./routes/departmentRoute");
} else if (fs.existsSync(dRoute2)) {
  departmentRoutes = require("./routes/departmentRoutes");
} else {
  console.error("Department route not found");
  process.exit(1);
}

const Admin = require("./models/Admin");

/* ===================== START SERVER ===================== */

(async () => {
  try {
    await connectDB();

    const app = express();
    const server = http.createServer(app);

    const allowedOrigins = [
      "https://university-assingment-portal-wbxg.vercel.app",
      "https://assignmentportal2026.vercel.app",
      "http://localhost:5173"
    ];

    // Initialize Socket.IO with CORS
    const io = new Server(server, {
      cors: {
        origin: allowedOrigins,
        credentials: true
      }
    });

    /* ===== MIDDLEWARE ===== */
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
    app.use(cookieParser());
    
    app.use(
      cors({
        origin: allowedOrigins,
        credentials: true
      })
    );

    /* ===== ROUTES ===== */
    app.use("/", authRoutes);
    app.use("/", adminRoutes);
    app.use("/", departmentRoutes);
    app.use("/", userRoutes);
    app.use("/", studentRoutes);
    app.use("/", professorRoutes);
    app.use("/", complaintRoutes);
    app.use("/", messageRoutes);

    /* ===== SOCKET.IO REAL-TIME COMMUNICATION ENGINE ===== */
    const onlineUsers = new Map(); // userId -> socketId

    io.on("connection", (socket) => {
      // User registers their socket ID
      socket.on("register_user", async (userId) => {
        if (!userId) return;
        onlineUsers.set(userId, socket.id);
        socket.userId = userId;

        try {
          await UserData.findByIdAndUpdate(userId, {
            isOnline: true,
            lastSeen: new Date()
          });

          // Broadcast user status change
          io.emit("user_status_changed", {
            userId,
            isOnline: true
          });
        } catch (err) {
          console.error("Socket register user error:", err);
        }
      });

      // Real-time direct message delivery
      socket.on("send_message", async (data) => {
        const { senderId, receiverId, message, messageId } = data;
        if (!senderId || !receiverId) return;

        const receiverSocketId = onlineUsers.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("receive_message", {
            _id: messageId,
            sender: senderId,
            receiver: receiverId,
            message,
            status: "sent",
            createdAt: new Date()
          });
        }
      });

      // Real-time typing indicators
      socket.on("typing_start", (data) => {
        const { senderId, receiverId } = data;
        const receiverSocketId = onlineUsers.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("user_typing", {
            senderId,
            isTyping: true
          });
        }
      });

      socket.on("typing_stop", (data) => {
        const { senderId, receiverId } = data;
        const receiverSocketId = onlineUsers.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("user_typing", {
            senderId,
            isTyping: false
          });
        }
      });

      // Real-time seen status update
      socket.on("mark_read", async (data) => {
        const { senderId, readerId } = data;
        const senderSocketId = onlineUsers.get(senderId);
        if (senderSocketId) {
          io.to(senderSocketId).emit("messages_seen", {
            readerId
          });
        }
      });

      // Handle socket disconnect
      socket.on("disconnect", async () => {
        if (socket.userId) {
          onlineUsers.delete(socket.userId);
          const disconnectTime = new Date();

          try {
            await UserData.findByIdAndUpdate(socket.userId, {
              isOnline: false,
              lastSeen: disconnectTime
            });

            io.emit("user_status_changed", {
              userId: socket.userId,
              isOnline: false,
              lastSeen: disconnectTime
            });
          } catch (err) {
            console.error("Socket disconnect error:", err);
          }
        }
      });
    });

    /* ===== ROOT ROUTE ===== */
    app.get("/", (req, res) => {
      res.status(200).send("University Assignment Portal is running");
    });

    /* ===== 404 HANDLER ===== */
    app.use((req, res) => {
      res.status(404);
      if (req.xhr || req.headers.accept?.includes("application/json")) {
        return res.json({ message: "Not Found" });
      }
      res.send("404 - Not Found");
    });

    /* ===== ERROR HANDLER ===== */
    app.use((err, req, res, next) => {
      console.error("Unhandled error:", err);
      res.status(500);

      if (req.xhr || req.headers.accept?.includes("application/json")) {
        return res.json({ message: "Server error" });
      }

      res.send("500 - Server error");
    });

    /* ===== DEFAULT ADMIN ===== */
    try {
      const adminExists = await Admin.findOne({
        email: "admin@university.com"
      });

      if (!adminExists) {
        await Admin.create({
          name: "Admin",
          email: "admin@university.com",
          password: "admin",
          role: "admin"
        });

        console.log("Default admin created");
      } else {
        const valid = await bcrypt.compare("admin", adminExists.password);

        if (!valid) {
          adminExists.password = "admin";
          await adminExists.save();

          console.log("Default admin password hash updated");
        }
      }
    } catch (err) {
      console.error("Admin creation failed:", err);
    }

    /* ===== START SERVER ===== */
    const port = process.env.PORT || 3000;

    server.listen(port, () => {
      console.log(`Server with Socket.IO running on port ${port}`);
    });

  } catch (err) {
    console.error("Startup failed:", err);
    process.exit(1);
  }
})();
