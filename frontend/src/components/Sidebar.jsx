import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  Users,
  MessageSquareWarning,
  FileText,
  Mail,
  Award,
  User,
  Headphones,
  LogOut,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Activity
} from "lucide-react";
import "../css/Sidebar.css";

const Sidebar = ({
  role = "Student",
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
  unreadComplaintsCount = 0,
  unreadMessagesCount = 0,
  onOpenContactAdmin,
  onOpenLogout
}) => {
  const location = useLocation();
  const lowerRole = role.toLowerCase();

  let menuItems = [];

  if (lowerRole === "admin") {
    menuItems = [
      { name: "Dashboard", path: "/admin/dashboard", exact: true, icon: LayoutDashboard },
      { name: "Departments", path: "/admin/departments", icon: Building2 },
      { name: "Users", path: "/admin/users", icon: Users },
      {
        name: "Complaints",
        path: "/admin/complaints",
        icon: MessageSquareWarning,
        badge: unreadComplaintsCount > 0 ? unreadComplaintsCount : null
      },
      { name: "Recent Activity", path: "/admin/activities", icon: Activity }
    ];
  } else if (lowerRole === "professor") {
    menuItems = [
      { name: "Dashboard", path: "/professor/dashboard", exact: true, icon: LayoutDashboard },
      { name: "My Reviews", path: "/professor/reviews", icon: Award },
      {
        name: "Messages",
        path: "/professor/messages",
        icon: Mail,
        badge: unreadMessagesCount > 0 ? unreadMessagesCount : null
      },
      { name: "Profile", path: "/professor/profile", icon: User }
    ];
  } else {
    // Student
    menuItems = [
      { name: "Dashboard", path: "/student/dashboard", exact: true, icon: LayoutDashboard },
      { name: "Assignments", path: "/student/assignments", icon: FileText },
      {
        name: "Messages",
        path: "/student/messages",
        icon: Mail,
        badge: unreadMessagesCount > 0 ? unreadMessagesCount : null
      },
      { name: "Profile", path: "/student/profile", icon: User }
    ];
  }

  const isItemActive = (item) => {
    if (item.exact) {
      return location.pathname === item.path;
    }
    return location.pathname.startsWith(item.path);
  };

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="sidebar-mobile-overlay"
          onClick={() => setMobileOpen(false)}
        ></div>
      )}

      <aside
        className={`app-sidebar ${collapsed ? "collapsed" : ""} ${
          mobileOpen ? "mobile-open" : ""
        }`}
      >
        {/* Brand Logo Header */}
        <div className="sidebar-brand">
          <div className="brand-icon-box">
            <GraduationCap size={20} color="#ffffff" />
          </div>
          {!collapsed && (
            <div className="brand-text-group">
              <span className="brand-title">University</span>
              <span className="brand-subtitle">Assignment Portal</span>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="sidebar-nav">
          <div className="nav-section-label">
            {!collapsed ? "Main Menu" : "•••"}
          </div>

          {menuItems.map((item) => {
            const active = isItemActive(item);
            const IconComponent = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`sidebar-nav-item ${active ? "active" : ""}`}
                onClick={() => setMobileOpen(false)}
                title={collapsed ? item.name : ""}
              >
                <span className="nav-item-icon">
                  <IconComponent size={19} />
                </span>

                {!collapsed && (
                  <span className="nav-item-label">{item.name}</span>
                )}

                {item.badge !== null && item.badge !== undefined && (
                  <span className="nav-badge-red" title={`${item.badge} unread`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="nav-divider"></div>

          {/* Contact Admin for Student & Professor */}
          {lowerRole !== "admin" && (
            <div
              className="sidebar-nav-item text-action-item"
              onClick={() => {
                setMobileOpen(false);
                onOpenContactAdmin();
              }}
              title={collapsed ? "Contact Admin" : ""}
            >
              <span className="nav-item-icon">
                <Headphones size={19} />
              </span>
              {!collapsed && <span className="nav-item-label">Contact Admin</span>}
            </div>
          )}

          {/* Logout Action */}
          <div
            className="sidebar-nav-item text-action-item logout-action-item"
            onClick={() => {
              setMobileOpen(false);
              onOpenLogout();
            }}
            title={collapsed ? "Logout" : ""}
          >
            <span className="nav-item-icon">
              <LogOut size={19} />
            </span>
            {!collapsed && <span className="nav-item-label">Logout</span>}
          </div>
        </nav>

        {/* Desktop Collapse Toggle */}
        <div className="sidebar-desktop-toggle">
          <button
            className="toggle-collapse-btn"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {collapsed ? (
              <ChevronRight size={18} />
            ) : (
              <>
                <ChevronLeft size={18} />
                <span className="toggle-text">Collapse Sidebar</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
