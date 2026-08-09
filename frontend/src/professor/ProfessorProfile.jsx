import React, { useEffect, useState, useRef } from "react";
import api from "../services/api";
import toast from "react-hot-toast";
import ProfessorLayout from "./ProfessorLayout";
import { User, Mail, Phone, Building2, Camera, Eye, EyeOff, Lock } from "lucide-react";
import "../css/StudentProfile.css";

const ProfessorProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    phone: "",
    newPassword: ""
  });

  const fetchProfile = async () => {
    try {
      const res = await api.get("/professor/profile");
      if (res.data && res.data.professor) {
        setProfile(res.data.professor);
        setFormData({
          phone: res.data.professor.phone || "",
          newPassword: ""
        });
        if (res.data.professor.profileImage) {
          setPreviewImage(res.data.professor.profileImage);
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
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result);
    };
    reader.readAsDataURL(file);
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
      const res = await api.post("/professor/profile", {
        phone: formData.phone,
        newPassword: formData.newPassword,
        profileImage: previewImage
      });

      if (res.data && res.data.success) {
        toast.success("Profile saved successfully!");
        setFormData((prev) => ({ ...prev, newPassword: "" }));
        setSelectedImage(null);
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
      <ProfessorLayout title="Professor Profile">
        <div className="form-page-container">
          <div className="card card-body text-center" style={{ padding: "40px" }}>
            Loading profile data...
          </div>
        </div>
      </ProfessorLayout>
    );
  }

  if (!profile) {
    return (
      <ProfessorLayout title="Professor Profile">
        <div className="form-page-container">
          <div className="card card-body text-center" style={{ padding: "40px" }}>
            Profile not found.
          </div>
        </div>
      </ProfessorLayout>
    );
  }

  const firstLetter = profile.name ? profile.name.charAt(0).toUpperCase() : "P";

  const depList = profile?.departments && profile.departments.length > 0
    ? profile.departments
    : (profile?.departmentName ? [profile.departmentName] : ["General"]);

  return (
    <ProfessorLayout title="Professor Profile" userName={profile.name}>
      <div className="form-page-container animate-fade-in">
        <div className="form-card card">
          <div className="card-header">
            <div className="card-header-title-group">
              <User size={22} className="header-icon-admin" />
              <div>
                <h2 className="card-title">My Professor Profile</h2>
                <p className="card-subtitle">Manage faculty information, phone number, and avatar</p>
              </div>
            </div>
          </div>

          <div className="card-body">
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
                <h2 className="profile-user-name">Prof. {profile.name}</h2>
                <span className="badge badge-success" style={{ marginTop: "4px" }}>
                  Professor
                </span>
              </div>
            </div>

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
                  <label className="form-label">Department(s)</label>
                  <div className="input-icon-wrapper">
                    <Building2 size={18} className="input-icon" />
                    <input value={depList.join(", ")} disabled className="form-input" />
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
                      name="newPassword"
                      value={formData.newPassword}
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
    </ProfessorLayout>
  );
};

export default ProfessorProfile;
