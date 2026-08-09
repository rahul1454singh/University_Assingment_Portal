const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserData"
  },
  senderName: {
    type: String,
    required: true
  },
  senderEmail: {
    type: String,
    required: true
  },
  senderRole: {
    type: String,
    enum: ["student", "professor", "Student", "Professor"],
    default: "student"
  },
  message: {
    type: String,
    required: true
  },
  adminEmail: {
    type: String,
    default: "admin@university.com"
  },
  adminPhone: {
    type: String,
    default: "+9779864292613"
  },
  status: {
    type: String,
    enum: ["Pending", "Read", "Resolved"],
    default: "Pending"
  },
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.models.Complaint || mongoose.model("Complaint", complaintSchema);
