import React, { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";
import { GraduationCap, Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck } from "lucide-react";
import "../css/Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return;

    setError("");
    setLoading(true);

    try {
      const response = await api.post("/login", {
        email,
        password
      });

      if (response.data.success) {
        localStorage.setItem(
          "user",
          JSON.stringify(response.data.user)
        );

        toast.success("Login Successful", {
          duration: 1000
        });

        setTimeout(() => {
          window.location.href = response.data.redirect;
        }, 1000);
      }
    } catch (err) {
      console.error("Login error:", err);
      const message =
        err.response?.data?.message || "Something went wrong";
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
              <h2>Sign In to Portal</h2>
              <p className="login-subtitle">Enter your university credentials below</p>
            </div>

            {error && (
              <div className="auth-alert-error">
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="auth-form">
              <div className="form-field-group">
                <label className="field-label">Email Address</label>
                <div className="input-group">
                  <Mail className="input-field-icon" size={18} />
                  <input
                    type="email"
                    className="login-input"
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-field-group">
                <div className="label-row">
                  <label className="field-label">Password</label>
                  <Link to="/forgot-password" className="forgot-link-text">
                    Forgot password?
                  </Link>
                </div>
                <div className="input-group">
                  <Lock className="input-field-icon" size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    className="login-input"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="toggle-password-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex="-1"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="login-btn">
                {loading ? (
                  <>
                    <span className="spinner-loader"></span>
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
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

export default Login;