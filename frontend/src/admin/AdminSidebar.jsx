import React from "react";
import { Link, useLocation } from "react-router-dom";

const AdminSidebar = ({
  sidebarOpen,
  role = "Admin",
  setLogoutOpen
}) => {
  const location = useLocation();

  const menuGroups = [
    {
      groupTitle: "OVERVIEW",
      items: [
        { name: "Dashboard", path: "/admin/dashboard" }
      ]
    },
    {
      groupTitle: "MANAGEMENT",
      items: [
        { name: "Departments", path: "/admin/departments" },
        { name: "Users", path: "/admin/users" }
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
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        ))}
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

export default AdminSidebar;
