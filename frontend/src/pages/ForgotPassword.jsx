import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";
import { Mail, KeyRound, Lock, Eye, EyeOff, ArrowLeft, CheckCircle2, RefreshCw, GraduationCap, ShieldAlert } from "lucide-react";
import "../css/ForgotPassword.css";

const ForgotPassword = () => {
  const navigate = useNavigate();

  // Step 1: Email, Step 2: OTP, Step 3: Reset Password
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");

  // OTP inputs (4 digits)
  const [otpDigits, setOtpDigits] = useState(["", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(60);
  const [timerActive, setTimerActive] = useState(false);

  // Password state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  // Countdown timer effect
  useEffect(() => {
    let timer = null;
    if (timerActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setTimerActive(false);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [timerActive, timeLeft]);

  // Step 1: Request OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email || !email.trim()) {
      toast.error("Please enter your email");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/api/forgot-password", { email: email.trim() });
      if (res.data && res.data.success) {
        toast.success(res.data.message || "OTP sent to your email!");
        setStep(2);
        setTimeLeft(60);
        setTimerActive(true);
      } else {
        toast.error(res.data?.message || "Failed to send OTP.");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "No account found with this email.");
    } finally {
      setLoading(false);
    }
  };

  // OTP Input change helper
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value;
    setOtpDigits(newDigits);

    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const combinedOtp = otpDigits.join("");
    if (combinedOtp.length !== 4) {
      toast.error("Please enter full 4-digit OTP.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/api/verify-otp", {
        email: email.trim(),
        otp: combinedOtp
      });
      if (res.data && res.data.success) {
        toast.success("OTP verified successfully!");
        setStep(3);
      } else {
        toast.error(res.data?.message || "Invalid or expired OTP.");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Invalid or expired OTP.");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    setLoading(true);
    try {
      const res = await api.post("/api/resend-otp", { email: email.trim() });
      if (res.data && res.data.success) {
        toast.success("A new OTP has been sent to your email.");
        setOtpDigits(["", "", "", ""]);
        setTimeLeft(60);
        setTimerActive(true);
      } else {
        toast.error(res.data?.message || "Failed to resend OTP.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to resend OTP.");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.trim().length < 4) {
      toast.error("Password must be at least 4 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/api/reset-password", {
        email: email.trim(),
        password: newPassword
      });
      if (res.data && res.data.success) {
        toast.success("Password reset successfully! Redirecting to login...");
        setTimeout(() => {
          navigate("/");
        }, 1500);
      } else {
        toast.error(res.data?.message || "Failed to reset password.");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error resetting password.");
    } finally {
      setLoading(false);
    }
  };

  // Password strength checker helper
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: "" };
    if (pass.length < 4) return { score: 1, label: "Weak" };
    if (pass.length < 8) return { score: 2, label: "Medium" };
    if (/[A-Z]/.test(pass) && /[0-9]/.test(pass)) return { score: 3, label: "Strong" };
    return { score: 2, label: "Medium" };
  };

  const strength = getPasswordStrength(newPassword);

  return (
    <div className="forgot-page">
      <div className="forgot-card-wrapper animate-fade-in">
        <div className="forgot-brand-header">
          <div className="forgot-brand-icon">
            <GraduationCap size={28} color="#ffffff" />
          </div>
          <span className="forgot-brand-title">University Assignment Portal</span>
        </div>

        <div className="forgot-box">
          {step === 1 && (
            <>
              <div className="step-header">
                <div className="step-badge">Step 1 of 3</div>
                <h2>Forgot Password?</h2>
                <p className="forgot-subtitle">
                  Enter your university email to receive a 4-digit verification code.
                </p>
              </div>

              <form onSubmit={handleSendOtp} className="auth-form">
                <div className="form-field-group">
                  <label className="field-label">Email Address</label>
                  <div className="input-group">
                    <Mail className="input-field-icon" size={18} />
                    <input
                      type="email"
                      className="login-input"
                      placeholder="Enter your university email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="forgot-submit-btn">
                  {loading ? "Sending OTP..." : "Send Verification Code"}
                </button>
              </form>
            </>
          )}

          {step === 2 && (
            <>
              <div className="step-header">
                <div className="step-badge">Step 2 of 3</div>
                <h2>Verify Code</h2>
                <p className="forgot-subtitle">
                  Enter the 4-digit code sent to <strong>{email}</strong>
                </p>
              </div>

              <form onSubmit={handleVerifyOtp} className="auth-form">
                <div className="otp-inputs-grid">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`otp-input-${idx}`}
                      type="text"
                      maxLength="1"
                      className="otp-single-box"
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      autoFocus={idx === 0}
                      required
                    />
                  ))}
                </div>

                <div className="timer-info-box">
                  {timeLeft > 0 ? (
                    <span className="timer-active-text">
                      Code expires in <strong>{timeLeft}s</strong>
                    </span>
                  ) : (
                    <span className="timer-expired-text">
                      <ShieldAlert size={16} /> Code expired. Please click resend below.
                    </span>
                  )}
                </div>

                {timeLeft > 0 ? (
                  <button type="submit" disabled={loading} className="forgot-submit-btn">
                    {loading ? "Verifying..." : "Verify Code"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="resend-btn"
                  >
                    <RefreshCw size={16} className={loading ? "spin" : ""} />
                    <span>{loading ? "Resending..." : "Resend OTP"}</span>
                  </button>
                )}
              </form>
            </>
          )}

          {step === 3 && (
            <>
              <div className="step-header">
                <div className="step-badge">Step 3 of 3</div>
                <h2>Reset Password</h2>
                <p className="forgot-subtitle">Create a new secure password for your account.</p>
              </div>

              <form onSubmit={handleResetPassword} className="auth-form">
                <div className="form-field-group">
                  <label className="field-label">New Password</label>
                  <div className="input-group">
                    <Lock className="input-field-icon" size={18} />
                    <input
                      type={showPassword ? "text" : "password"}
                      className="login-input"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="toggle-password-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex="-1"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {newPassword && (
                    <div className="strength-meter">
                      <div className={`meter-bar strength-${strength.score}`}></div>
                      <span className="strength-label">Strength: {strength.label}</span>
                    </div>
                  )}
                </div>

                <div className="form-field-group">
                  <label className="field-label">Confirm New Password</label>
                  <div className="input-group">
                    <Lock className="input-field-icon" size={18} />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      className="login-input"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="toggle-password-btn"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      tabIndex="-1"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {confirmPassword && (
                    <div className="matching-feedback">
                      {newPassword === confirmPassword ? (
                        <span className="match-success"><CheckCircle2 size={14} /> Passwords match</span>
                      ) : (
                        <span className="match-error">Passwords do not match</span>
                      )}
                    </div>
                  )}
                </div>

                <button type="submit" disabled={loading} className="forgot-submit-btn">
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
              </form>
            </>
          )}

          <div className="forgot-footer-link">
            <Link to="/" className="back-login-link">
              <ArrowLeft size={16} />
              <span>Back to Login</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
