import React from "react";
import { Menu, X, Bell, User, GraduationCap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../css/Navbar.css";

const Navbar = ({
  mobileOpen,
  setMobileOpen,
  userName = "User",
  profileImage = "",
  title = "Dashboard",
  role = "Student"
}) => {
  const navigate = useNavigate();

  const firstName = userName ? userName.split(" ")[0] : "User";
  const initialLetter = firstName.charAt(0).toUpperCase();

  const getRoleBadgeStyle = (roleName) => {
    const r = roleName ? roleName.toLowerCase() : "student";
    if (r === "admin") return "role-tag-admin";
    if (r === "professor") return "role-tag-prof";
    return "role-tag-student";
  };

  const handleProfileClick = () => {
    const r = role ? role.toLowerCase() : "student";
    if (r === "student") navigate("/student/profile");
    if (r === "professor") navigate("/professor/profile");
  };

  return (
    <header className="app-navbar">
      <div className="navbar-left">
        <button
          className="mobile-hamburger-btn"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle Navigation Menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <div className="navbar-title-group">
          <h1 className="navbar-title">{title}</h1>
        </div>
      </div>

      <div className="navbar-center-portal-title">
        <GraduationCap size={20} className="portal-icon" />
        <span>University Portal</span>
      </div>

      <div className="navbar-right">
        <div className={`role-indicator-badge ${getRoleBadgeStyle(role)}`}>
          {role}
        </div>

        <div className="user-greeting-wrapper">
          <span className="user-greeting">
            Hello, <strong>{firstName}</strong>
          </span>
        </div>

        <div 
          className="user-avatar-wrapper"
          onClick={handleProfileClick}
          style={{ cursor: "pointer" }}
        >
          {profileImage ? (
            <img
              src={profileImage}
              alt={userName}
              className="user-avatar-img"
              onError={(e) => {
                e.target.style.display = "none";
                if (e.target.nextSibling) {
                  e.target.nextSibling.style.display = "flex";
                }
              }}
            />
          ) : null}
          <div
            className="user-avatar-fallback"
            style={{ display: profileImage ? "none" : "flex" }}
          >
            {initialLetter}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
