import React from "react";

const AdminNavbar = ({ sidebarOpen, setSidebarOpen, userName, title }) => {
  const hour = new Date().getHours();
  let greeting = "Good Evening";

  if (hour >= 5 && hour < 12) {
    greeting = "Good Morning";
  } else if (hour >= 12 && hour < 17) {
    greeting = "Good Afternoon";
  } else if (hour >= 17 && hour < 21) {
    greeting = "Good Evening";
  } else {
    greeting = "Good Night";
  }

  const nameToDisplay = userName || "Admin";
  const initialLetter = nameToDisplay.charAt(0).toUpperCase();

  return (
    <div className="admin-navbar">
      <div
        className={`menu-toggle ${sidebarOpen ? "open" : ""}`}
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <div className="bars">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      <div className="navbar-title">
        {title || "Admin Dashboard"}
      </div>

      <div className="navbar-center-portal-title">
        University Assignment Portal
      </div>

      <div className="navbar-right">
        <span className="greeting-text">
          {greeting}, <strong>{nameToDisplay}</strong>
        </span>
        <div className="user-avatar">
          {initialLetter}
        </div>
      </div>
    </div>
  );
};

export default AdminNavbar;
