import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import AdminLayout from "./AdminLayout";
import toast from "react-hot-toast";
import { Building2, ArrowLeft, CheckCircle2 } from "lucide-react";
import "../css/CreateDepartment.css";

const CreateDepartment = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    type: "",
    address: ""
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    try {
      const res = await api.post("/admin/departments", formData);
      toast.success(res.data?.message || "Department created successfully!");
      setError("");

      setTimeout(() => {
        navigate("/admin/departments");
      }, 800);
    } catch (err) {
      const msg = err.response?.data?.message || "Error creating department";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="Create Department">
      <div className="form-page-container animate-fade-in">
        <div className="form-card card">
          <div className="card-header">
            <div className="card-header-title-group">
              <Building2 size={22} className="header-icon-admin" />
              <div>
                <h2 className="card-title">Create New Department</h2>
              </div>
            </div>
            <button
              className="btn btn-sm btn-outline"
              onClick={() => navigate("/admin/departments")}
            >
              <ArrowLeft size={16} />
              <span>Back to Directory</span>
            </button>
          </div>

          <div className="card-body">
            {error && <div className="auth-alert-error" style={{ marginBottom: "20px" }}>{error}</div>}

            <form onSubmit={handleSubmit} className="admin-form">
              <div className="form-group">
                <label className="form-label">Department Name</label>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  placeholder="e.g. Department of Computer Science"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Program Type</label>
                <select
                  name="type"
                  className="form-select"
                  value={formData.type}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Program Type</option>
                  <option value="UG">UG (Undergraduate)</option>
                  <option value="PG">PG (Postgraduate)</option>
                  <option value="Research">Research</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Location / Address</label>
                <input
                  type="text"
                  name="address"
                  className="form-input"
                  placeholder="e.g. Science Block A, Room 302"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-actions-row">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => navigate("/admin/departments")}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? "Creating..." : "Create Department"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default CreateDepartment;
