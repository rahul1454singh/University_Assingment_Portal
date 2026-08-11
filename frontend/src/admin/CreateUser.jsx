import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import AdminLayout from "./AdminLayout";
import toast from "react-hot-toast";
import { User, ArrowLeft, Eye, EyeOff, Lock, Mail, Phone, Building2 } from "lucide-react";
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import "../css/CreateUser.css";

const CreateUser = () => {
  const navigate = useNavigate();

  const [departments, setDepartments] = useState([]);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "student",
    password: ""
  });

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      const res = await api.get("/admin/departments/options");
      setDepartments(res.data.departments || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load departments");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value
    });

    if (name === "role" && value === "student") {
      if (selectedDepartments.length > 1) {
        setSelectedDepartments([selectedDepartments[0]]);
      }
    }
  };

  const handleDepartmentToggle = (depId) => {
    if (form.role === "student") {
      setSelectedDepartments([depId]);
    } else {
      if (selectedDepartments.includes(depId)) {
        setSelectedDepartments(selectedDepartments.filter((id) => id !== depId));
      } else {
        setSelectedDepartments([...selectedDepartments, depId]);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedDepartments.length === 0) {
      toast.error("Please select at least one department.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...form,
        departments: selectedDepartments,
        department: selectedDepartments[0]
      };
      const res = await api.post("/admin/users", payload);
      toast.success(res.data?.message || "User created successfully!");

      setTimeout(() => {
        navigate("/admin/users");
      }, 800);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || "Error creating user";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="Create User">
      <div className="form-page-container animate-fade-in">
        <div className="form-card card">
          <div className="card-header">
            <div className="card-header-title-group">
              <User size={22} className="header-icon-admin" />
              <div>
                <h2 className="card-title">Create New User Account</h2>
              </div>
            </div>
            <button
              className="btn btn-sm btn-outline"
              onClick={() => navigate("/admin/users")}
            >
              <ArrowLeft size={16} />
              <span>Back to Directory</span>
            </button>
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
                      placeholder="e.g. John Doe"
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
                      placeholder="e.g. jdoe@university.edu"
                      value={form.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <PhoneInput
                    international
                    defaultCountry="NP"
                    name="phone"
                    className="form-input phone-input-override"
                    placeholder="e.g. +977 9812345678"
                    value={form.phone}
                    onChange={(value) => setForm({ ...form, phone: value || "" })}
                  />
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
                  <span>Assigned Department(s) — {form.role === "student" ? "Select One:" : "Select One or Multiple:"}</span>
                </label>
                <div className="dept-checkbox-grid">
                  {departments.map((dep) => {
                    const checked = selectedDepartments.includes(dep._id);
                    return (
                      <label key={dep._id} className={`dept-checkbox-pill ${checked ? "selected" : ""}`}>
                        <input
                          type={form.role === "student" ? "radio" : "checkbox"}
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
                <label className="form-label">Initial Password</label>
                <div className="input-icon-wrapper">
                  <Lock size={18} className="input-icon" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    className="form-input"
                    placeholder="Leave blank to auto-generate password"
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
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? "Creating User..." : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default CreateUser;
