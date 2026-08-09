const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    userName: {
      type: String,
      default: "System Admin"
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin"
    },
    isAdminAction: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("ActivityLog", activityLogSchema);
