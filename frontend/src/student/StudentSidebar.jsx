import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import api from "../services/api";

const StudentSidebar = ({
  sidebarOpen,
  role = "Student",
  userEmail = "",
  setLogoutOpen
}) => {
  const location = useLocation();

  const handleContactAdmin = () => {
    const message = `Hello Admin, I am writing to you regarding a university portal request (password changes, profile updates, or general support).\nMy Email: ${userEmail || "Not provided"}`;
    const whatsappUrl = `https://wa.me/9779864292613?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get("/api/messages/unread-count");
      if (res.data && typeof res.data.unreadCount === "number") {
        setUnreadCount(res.data.unreadCount);
      }
    } catch (err) {
      // silent
    }
  };

  const menuGroups = [
    {
      groupTitle: "MAIN MENU",
      items: [
        { name: "Dashboard", path: "/student/dashboard" },
        { name: "Assignments", path: "/student/assignments" },
        { name: "Messages", path: "/student/messages", badge: unreadCount },
        { name: "Profile", path: "/student/profile" }
      ]
    }
  ];

  return (
    <div className={`sidebar ${sidebarOpen ? " show" : ""}`}>
      <div className="sidebar-menu-wrapper">
        {menuGroups.map((group, idx) => (
          <div key={idx} className="sidebar-group">
            <div className="sidebar-group-title">{group.groupTitle}</div>
            <div className="sidebar-menu-list">
              {group.items.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={
                    location.pathname.startsWith(item.path) ? "active" : ""
                  }
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
                >
                  <span>{item.name}</span>
                  {item.badge > 0 && (
                    <span style={{ background: "#ef4444", color: "#ffffff", padding: "2px 8px", borderRadius: "10px", fontSize: "11px", fontWeight: "800", marginLeft: "auto" }}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        ))}

        <div className="sidebar-group">
          <div className="sidebar-group-title">SUPPORT</div>
          <div className="sidebar-menu-list">
            <button
              className="contact-admin-btn"
              onClick={handleContactAdmin}
            >
              Contact Admin
            </button>
          </div>
        </div>
      </div>

      <div className="sidebar-logout-footer">
        <button
          className="logout-btn"
          onClick={() => setLogoutOpen(true)}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default StudentSidebar;