const ActivityLog = require("../models/ActivityLog");

/**
 * Log a system activity in the database.
 * @param {string} title - Activity Title (e.g. "New Department Created")
 * @param {string} description - Activity Description (e.g. "Department Computer Science was added to system.")
 * @param {string} [userName] - Name of the user performing the action (default: "System Admin")
 * @param {string} [performedById] - Admin or User ID
 * @param {boolean} [isAdminAction] - Flag indicating whether this is an Admin activity (default: true)
 */
const logActivity = async (title, description, userName = "System Admin", performedById = null, isAdminAction = true) => {
  try {
    await ActivityLog.create({
      title,
      description,
      userName: userName || "System Admin",
      performedBy: performedById || null,
      isAdminAction: isAdminAction !== false
    });
  } catch (err) {
    console.error("Failed to log activity:", err);
  }
};

module.exports = { logActivity };
