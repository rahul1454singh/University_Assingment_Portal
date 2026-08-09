import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import AdminLayout from "./AdminLayout";
import toast from "react-hot-toast";
import { User, ArrowLeft, Eye, EyeOff, Lock, Mail, Phone, Building2 } from "lucide-react";
import "../css/EditUser.css";

const EditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [departments, setDepartments] = useState([]);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    password: ""
  });

  useEffect(() => {
    loadDepartments();
    loadUser();
  }, [id]);

  const loadDepartments = async () => {
    try {
      const res = await api.get("/admin/departments/options");
      setDepartments(res.data.departments || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadUser = async () => {
    try {
      const res = await api.get(`/admin/users/${id}`);
      const user = res.data.user;
      if (user) {
        setForm({
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
          role: user.role || "student",
          password: ""
        });

        const initialDepIds = [];
        if (Array.isArray(user.departments) && user.departments.length > 0) {
          user.departments.forEach((d) => {
            const depId = typeof d === "object" ? d._id : d;
            if (depId) initialDepIds.push(depId);
          });
        }
        if (initialDepIds.length === 0 && user.department) {
          const singleId = typeof user.department === "object" ? user.department._id : user.department;
          if (singleId) initialDepIds.push(singleId);
        }
        setSelectedDepartments(initialDepIds);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load user");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleDepartmentToggle = (depId) => {
    if (selectedDepartments.includes(depId)) {
      setSelectedDepartments(selectedDepartments.filter((d) => d !== depId));
    } else {
      setSelectedDepartments([...selectedDepartments, depId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedDepartments.length === 0) {
      toast.error("Please select at least one department.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        departments: selectedDepartments,
        department: selectedDepartments[0]
      };
      const res = await api.put(`/admin/users/${id}`, payload);
      toast.success(res.data?.message || "User updated successfully!");

      setTimeout(() => {
        navigate("/admin/users");
      }, 800);
    } catch (err) {
      console.error(err);
      toast.error("Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Edit User">
        <div className="form-page-container">
          <div className="card card-body text-center" style={{ padding: "40px" }}>
            Loading user profile...
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Edit User">
      <div className="form-page-container animate-fade-in">
        <div className="form-card card">
          <div className="card-header">
            <div className="card-header-title-group">
              <User size={22} className="header-icon-admin" />
              <div>
                <h2 className="card-title">Edit User Account</h2>
              </div>
            </div>
          </div>

          <div className="card-body">
            <form onSubmit={handleSubmit} className="admin-form">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <div className="input-icon-wrapper">
                    <User size={18} className="input-icon" />
                    <input
                      type="text"
                      name="name"
                      className="form-input"
                      value={form.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <div className="input-icon-wrapper">
                    <Mail size={18} className="input-icon" />
                    <input
                      type="email"
                      name="email"
                      className="form-input"
                      value={form.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <div className="input-icon-wrapper">
                    <Phone size={18} className="input-icon" />
                    <input
                      type="text"
                      name="phone"
                      className="form-input"
                      value={form.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Account Role</label>
                  <select
                    name="role"
                    className="form-select"
                    value={form.role}
                    onChange={handleChange}
                  >
                    <option value="student">Student</option>
                    <option value="professor">Professor</option>
                  </select>
                </div>
              </div>

              {/* Department Checkboxes Group */}
              <div className="form-group full-width" style={{ marginTop: "10px" }}>
                <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Building2 size={16} />
                  <span>Assigned Department(s) — Select One or Multiple:</span>
                </label>
                <div className="dept-checkbox-grid">
                  {departments.map((dep) => {
                    const checked = selectedDepartments.includes(dep._id);
                    return (
                      <label key={dep._id} className={`dept-checkbox-pill ${checked ? "selected" : ""}`}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => handleDepartmentToggle(dep._id)}
                        />
                        <span>{dep.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="form-group full-width">
                <label className="form-label">New Password (leave blank to keep unchanged)</label>
                <div className="input-icon-wrapper">
                  <Lock size={18} className="input-icon" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    className="form-input"
                    placeholder="Leave blank to keep old password"
                    value={form.password}
                    onChange={handleChange}
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

              <div className="form-actions-row">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => navigate("/admin/users")}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? "Saving Changes..." : "Save User Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default EditUser;
