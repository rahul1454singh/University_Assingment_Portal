import React from "react";

const StudentNavbar = ({
  sidebarOpen,
  setSidebarOpen,
  userName = "Student",
  userEmail = "",
  title = "Student Dashboard"
}) => {
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

  const nameToDisplay = userName || "Student";
  const initialLetter = nameToDisplay.charAt(0).toUpperCase();

  const handleContactAdmin = () => {
    const message = `Hello Admin, I am writing to you regarding a university portal request (password changes, profile updates, or general support).\nMy Email: ${userEmail || "Not provided"}`;
    const whatsappUrl = `https://wa.me/9779864292613?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

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
        {title}
      </div>

      <div className="navbar-center-portal-title">
        University Assignment Portal
      </div>

      <div className="navbar-right">
        <button
          className="navbar-contact-admin-btn"
          onClick={handleContactAdmin}
          title="Contact Admin via WhatsApp"
        >
          Contact Admin
        </button>

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

export default StudentNavbar;