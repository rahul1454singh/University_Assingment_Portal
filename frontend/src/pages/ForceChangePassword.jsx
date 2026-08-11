import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";
import { GraduationCap, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import "../css/Login.css";

function ForceChangePassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!newPassword || newPassword.length < 6) {
      setError("New password must be at least 6 characters long");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await api.post("/api/auth/force-change-password", {
        currentPassword,
        newPassword
      });

      if (response.data.success) {
        toast.success("New password set successfully", {
          duration: 2000
        });

        // Redirect to login after a short delay
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      }
    } catch (err) {
      console.error("Force change password error:", err);
      const message =
        err.response?.data?.message || "Something went wrong. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Left Hero Brand Panel */}
        <div className="login-hero-panel">
          <div className="hero-brand-header">
            <div className="brand-logo-icon">
              <GraduationCap size={32} color="#ffffff" />
            </div>
            <span className="brand-portal-title">University Portal</span>
          </div>

          <div className="hero-content-body">
            <h1 className="hero-heading">Welcome to Academic Portal</h1>
            <p className="hero-description">
              Stay on top of coursework, submissions, feedback, and academic communication.
            </p>
          </div>

          <div className="hero-footer-note">
            © {new Date().getFullYear()} University Assignment Portal. All rights reserved.
          </div>
        </div>

        {/* Right Form Card */}
        <div className="login-form-wrapper">
          <div className="login-box">
            <div className="login-header">
              <h2>Change Password</h2>
              <p className="login-subtitle">
                As a new user, you must change your temporary password to continue.
              </p>
            </div>

            {error && (
              <div className="auth-alert-error">
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-field-group">
                <label className="field-label">Current Password</label>
                <div className="input-group">
                  <Lock className="input-field-icon" size={18} />
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    className="login-input"
                    placeholder="Enter current temporary password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="toggle-password-btn"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    tabIndex="-1"
                    aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                  >
                    {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="form-field-group">
                <label className="field-label">New Password</label>
                <div className="input-group">
                  <Lock className="input-field-icon" size={18} />
                  <input
                    type={showNewPassword ? "text" : "password"}
                    className="login-input"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="toggle-password-btn"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    tabIndex="-1"
                    aria-label={showNewPassword ? "Hide password" : "Show password"}
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="login-btn">
                {loading ? (
                  <>
                    <span className="spinner-loader"></span>
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <span>Set New Password</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="auth-footer-help">
              <div className="mobile-footer-note">
                © {new Date().getFullYear()} University Assignment Portal. All rights reserved.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForceChangePassword;
