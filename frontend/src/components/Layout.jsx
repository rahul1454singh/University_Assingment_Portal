import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";

import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import LogoutModal from "./LogoutModal";
import ContactAdminModal from "./ContactAdminModal";
import "../css/Layout.css";

const Layout = ({
  children,
  title = "Dashboard",
  role = "Student",
  userName: initialUserName,
  profileImage: initialProfileImage
}) => {
  const navigate = useNavigate();

  const [userName, setUserName] = useState(initialUserName || "User");
  const [profileImage, setProfileImage] = useState(initialProfileImage || "");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const [logoutOpen, setLogoutOpen] = useState(false);
  const [contactAdminOpen, setContactAdminOpen] = useState(false);
  const [unreadComplaints, setUnreadComplaints] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    if (title) {
      document.title = `${title} | University Assignment Portal`;
    } else {
      document.title = "University Assignment Portal";
    }
  }, [title]);

  useEffect(() => {
    // Load stored user info
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        setUserName(u.name || u.fullName || "User");
        if (u.profileImage) setProfileImage(u.profileImage);
      } catch (e) {}
    }

    // Fetch up-to-date user profile
    fetchCurrentUser();

    // If Admin, fetch unread complaints count
    if (role.toLowerCase() === "admin") {
      fetchUnreadComplaints();
    } else {
      fetchUnreadMessages();
      const interval = setInterval(fetchUnreadMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [role]);

  const fetchCurrentUser = async () => {
    try {
      const res = await api.get("/api/auth/me");
      if (res.data && res.data.success && res.data.user) {
        setUserName(res.data.user.name || "User");
        if (res.data.user.profileImage) {
          setProfileImage(res.data.user.profileImage);
        }
      }
    } catch (e) {
      // Ignore fallback
    }
  };

  const fetchUnreadComplaints = async () => {
    try {
      const res = await api.get("/api/admin/complaints/unread-count");
      if (res.data && res.data.success) {
        setUnreadComplaints(res.data.unreadCount || 0);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchUnreadMessages = async () => {
    try {
      const res = await api.get("/api/messages/unread-count");
      if (res.data && typeof res.data.unreadCount === "number") {
        setUnreadMessages(res.data.unreadCount);
      }
    } catch (e) {
      // silent
    }
  };

  const handleConfirmLogout = useCallback(async () => {
    try {
      setLogoutOpen(false);
      await api.post("/logout");
    } catch (e) {
      console.error(e);
    } finally {
      localStorage.removeItem("user");
      toast.success("Logged out successfully");
      navigate("/");
    }
  }, [navigate]);

  const handleCloseLogout = useCallback(() => {
    setLogoutOpen(false);
  }, []);

  const handleCloseContactAdmin = useCallback(() => {
    setContactAdminOpen(false);
  }, []);

  const handleOpenContactAdmin = useCallback(() => {
    setContactAdminOpen(true);
  }, []);

  const handleOpenLogout = useCallback(() => {
    setLogoutOpen(true);
  }, []);

  return (
    <div className="layout-root">
      <Navbar
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        userName={userName}
        profileImage={profileImage}
        title={title}
        role={role}
      />

      <div className="layout-body">
        <Sidebar
          role={role}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
          unreadComplaintsCount={unreadComplaints}
          unreadMessagesCount={unreadMessages}
          onOpenContactAdmin={handleOpenContactAdmin}
          onOpenLogout={handleOpenLogout}
        />

        <main className={`layout-main ${collapsed ? "collapsed-main" : ""}`}>
          <div className="main-content-container">{children}</div>

          <footer className="app-footer">
            <div className="footer-title">University Assignment Portal</div>
          </footer>
        </main>
      </div>

      <LogoutModal
        isOpen={logoutOpen}
        onClose={handleCloseLogout}
        onConfirm={handleConfirmLogout}
      />

      <ContactAdminModal
        isOpen={contactAdminOpen}
        onClose={handleCloseContactAdmin}
      />
    </div>
  );
};

export default Layout;
