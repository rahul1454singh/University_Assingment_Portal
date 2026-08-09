import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import AdminLayout from "./AdminLayout";
import toast from "react-hot-toast";
import { Building2, ArrowLeft } from "lucide-react";
import "../css/EditDepartment.css";

const EditDepartment = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    type: "",
    address: ""
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadDepartment();
  }, [id]);

  const loadDepartment = async () => {
    try {
      const res = await api.get(`/admin/departments/${id}`);
      if (res.data && res.data.department) {
        setFormData({
          name: res.data.department.name || "",
          type: res.data.department.type || "",
          address: res.data.department.address || ""
        });
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load department details");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);
    try {
      const res = await api.put(`/admin/departments/${id}`, formData);
      toast.success(res.data?.message || "Department updated successfully!");

      setTimeout(() => {
        navigate("/admin/departments");
      }, 800);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error updating department");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Edit Department">
        <div className="form-page-container">
          <div className="card card-body text-center" style={{ padding: "40px" }}>
            Loading department data...
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Edit Department">
      <div className="form-page-container animate-fade-in">
        <div className="form-card card">
          <div className="card-header">
            <div className="card-header-title-group">
              <Building2 size={22} className="header-icon-admin" />
              <div>
                <h2 className="card-title">Edit Department</h2>
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
            <form onSubmit={handleSubmit} className="admin-form">
              <div className="form-group">
                <label className="form-label">Department Name</label>
                <input
                  type="text"
                  name="name"
                  className="form-input"
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
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default EditDepartment;
