import React, { useEffect, useState, useRef } from "react";
import api from "../services/api";
import toast from "react-hot-toast";
import StudentLayout from "./StudentLayout";
import { User, Mail, Phone, Building2, Camera, Eye, EyeOff, Lock } from "lucide-react";
import DepartmentCell from "../components/DepartmentCell";
import "../css/StudentProfile.css";

const StudentProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showAllDeps, setShowAllDeps] = useState(false);
  const [openPopoverId, setOpenPopoverId] = useState(null);

  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    phone: "",
    password: ""
  });

  const fetchProfile = async () => {
    try {
      const res = await api.get("/api/student/profile");
      if (res.data && res.data.success) {
        setProfile(res.data.user);
        setFormData({
          phone: res.data.user.phone || "",
          password: ""
        });
        if (res.data.user.profileImage) {
          setPreviewImage(res.data.user.profileImage);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Maximum profile image size is 2MB.");
      e.target.value = "";
      return;
    }

    setSelectedImage(file);
    const imageURL = URL.createObjectURL(file);
    setPreviewImage(imageURL);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);

      if (selectedImage) {
        const imageData = new FormData();
        imageData.append("profileImage", selectedImage);
        const imgRes = await api.post(
          "/api/student/profile/upload-image",
          imageData,
          {
            headers: {
              "Content-Type": "multipart/form-data"
            }
          }
        );
        if (imgRes.data && imgRes.data.success) {
          setSelectedImage(null);
          if (imgRes.data.profileImage) {
            setPreviewImage(imgRes.data.profileImage);
          }
        }
      }

      const res = await api.put("/api/student/profile/update", formData);

      if (res.data && res.data.success) {
        toast.success("Profile saved successfully!");
        setFormData((prev) => ({ ...prev, password: "" }));
        fetchProfile();
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to save profile changes");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <StudentLayout title="Student Profile">
        <div className="form-page-container">
          <div className="card card-body text-center" style={{ padding: "40px" }}>
            Loading profile data...
          </div>
        </div>
      </StudentLayout>
    );
  }

  if (!profile) {
    return (
      <StudentLayout title="Student Profile">
        <div className="form-page-container">
          <div className="card card-body text-center" style={{ padding: "40px" }}>
            Profile not found.
          </div>
        </div>
      </StudentLayout>
    );
  }

  const firstLetter = profile.name
    ? profile.name.charAt(0).toUpperCase()
    : "S";

  const depList = profile?.departments && profile.departments.length > 0
    ? profile.departments
    : (profile?.department ? [profile.department] : ["General"]);

  return (
    <StudentLayout title="Student Profile" userName={profile.name}>
      <div className="form-page-container animate-fade-in">
        <div className="form-card card">
          <div className="card-header">
            <div className="card-header-title-group">
              <User size={22} className="header-icon-admin" />
              <div>
                <h2 className="card-title">My Student Profile</h2>
                <p className="card-subtitle">Manage personal information, contact number, and avatar</p>
              </div>
            </div>
          </div>

          <div className="card-body">
            {/* Header Info Inside Container */}
            <div className="profile-header-info">
              <div
                className="profile-avatar-container"
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                title="Click to upload avatar image"
              >
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="Profile"
                    className="profile-avatar-img"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="profile-avatar-fallback">{firstLetter}</div>
                )}

                <div className="profile-avatar-overlay">
                  <Camera size={18} />
                  <span>Upload Avatar</span>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: "none" }}
                />
              </div>

              <div className="profile-user-details">
                <h2 className="profile-user-name">{profile.name}</h2>
                <span className="badge badge-info" style={{ marginTop: "4px" }}>
                  {profile.role || "Student"}
                </span>
              </div>
            </div>

            {/* Form Layout */}
            <form onSubmit={handleSubmit} className="admin-form" style={{ marginTop: "24px" }}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <div className="input-icon-wrapper">
                    <User size={18} className="input-icon" />
                    <input value={profile.name} disabled className="form-input" />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">University Email</label>
                  <div className="input-icon-wrapper">
                    <Mail size={18} className="input-icon" />
                    <input value={profile.email} disabled className="form-input" />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Departments</label>
                  <div className="input-icon-wrapper" style={{ padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-md)', backgroundColor: 'var(--bg-secondary)', display: 'flex', alignItems: 'center' }}>
                    <Building2 size={18} className="input-icon" style={{ position: 'static', transform: 'none', color: 'var(--text-muted)' }} />
                    <div style={{ marginLeft: '8px' }}>
                      <DepartmentCell
                        departments={depList}
                        userId={profile._id}
                        openPopoverId={openPopoverId}
                        setOpenPopoverId={setOpenPopoverId}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <div className="input-icon-wrapper">
                    <Phone size={18} className="input-icon" />
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter phone number"
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group full-width">
                  <label className="form-label">New Password (leave blank to keep unchanged)</label>
                  <div className="input-icon-wrapper">
                    <Lock size={18} className="input-icon" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter new password"
                      className="form-input"
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
                </div>
              </div>

              <div className="form-actions-row">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? "Saving Changes..." : "Save Profile Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
};

export default StudentProfile;
