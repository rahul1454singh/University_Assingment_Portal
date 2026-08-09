import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import StudentLayout from "./StudentLayout";
import api from "../services/api";
import toast from "react-hot-toast";
import { Pencil, ArrowLeft, FileText, UploadCloud, Eye } from "lucide-react";
import "../css/StudentEditAssignment.css";

const StudentEditAssignment = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [professors, setProfessors] = useState([]);
  const [currentPdf, setCurrentPdf] = useState(null);
  const [file, setFile] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    professor: "",
    category: ""
  });

  useEffect(() => {
    loadAssignment();
  }, [id]);

  const loadAssignment = async () => {
    try {
      const res = await api.get(`/api/student/assignments/${id}/edit`);
      if (!res.data.success) {
        toast.error(res.data.message || "Failed to load assignment");
        navigate("/student/assignments");
        return;
      }

      const assignment = res.data.assignment;
      setProfessors(res.data.professors || []);
      setCurrentPdf(assignment.file);

      setFormData({
        title: assignment.title || "",
        description: assignment.description || "",
        professor: assignment.reviewerId?._id || "",
        category: assignment.category || ""
      });
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to load assignment.");
      navigate("/student/assignments");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) {
      setFile(null);
      return;
    }

    if (
      selectedFile.type !== "application/pdf" &&
      !selectedFile.name.toLowerCase().endsWith(".pdf")
    ) {
      toast.error("Only PDF files are allowed.");
      e.target.value = "";
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error("PDF size must be less than 10 MB.");
      e.target.value = "";
      return;
    }

    setFile(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Assignment title is required.");
      return;
    }
    if (formData.title.trim().length < 3) {
      toast.error("Title must contain at least 3 characters.");
      return;
    }
    if (!formData.professor) {
      toast.error("Please select a professor.");
      return;
    }
    if (!formData.category) {
      toast.error("Please select a category.");
      return;
    }
    if (!formData.description.trim()) {
      toast.error("Please enter assignment description.");
      return;
    }

    const updateData = new FormData();
    updateData.append("title", formData.title.trim());
    updateData.append("description", formData.description.trim());
    updateData.append("category", formData.category);
    updateData.append("professor", formData.professor);

    if (file) {
      updateData.append("file", file);
    }

    let loadingToast;
    try {
      setSaving(true);
      loadingToast = toast.loading("Updating assignment...");

      const res = await api.put(
        `/api/student/assignments/${id}/edit`,
        updateData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );

      toast.dismiss(loadingToast);

      if (res.data && res.data.success) {
        toast.success("Assignment updated successfully!");
        setTimeout(() => {
          navigate("/student/assignments");
        }, 800);
      } else {
        toast.error(res.data.message || "Update failed.");
      }
    } catch (err) {
      console.error(err);
      if (loadingToast) toast.dismiss(loadingToast);
      toast.error(err.response?.data?.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <StudentLayout title="Edit Assignment">
        <div className="form-page-container">
          <div className="card card-body text-center" style={{ padding: "40px" }}>
            Loading assignment details...
          </div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout title="Edit Assignment">
      <div className="form-page-container animate-fade-in">
        <div className="form-card card">
          <div className="card-header">
            <div className="card-header-title-group">
              <Pencil size={22} className="header-icon-admin" />
              <div>
                <h2 className="card-title">Edit Assignment</h2>
                <p className="card-subtitle">Update assignment details or replace submission file</p>
              </div>
            </div>
            <button
              className="btn btn-sm btn-outline"
              onClick={() => navigate("/student/assignments")}
            >
              <ArrowLeft size={16} />
              <span>Back to List</span>
            </button>
          </div>

          <div className="card-body">
            <form className="admin-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Assignment Title</label>
                <input
                  type="text"
                  name="title"
                  className="form-input"
                  placeholder="Enter assignment title"
                  value={formData.title}
                  onChange={handleChange}
                />
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Select Professor</label>
                  <select
                    name="professor"
                    className="form-select"
                    value={formData.professor}
                    onChange={handleChange}
                  >
                    <option value="">Select Professor</option>
                    {professors.map((prof) => (
                      <option key={prof._id} value={prof._id}>
                        {prof.fullName || prof.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Assignment Category</label>
                  <select
                    name="category"
                    className="form-select"
                    value={formData.category}
                    onChange={handleChange}
                  >
                    <option value="">Select Category</option>
                    <option value="Assignment">Assignment</option>
                    <option value="Report">Report</option>
                    <option value="Thesis">Thesis</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  rows="3"
                  name="description"
                  className="form-textarea"
                  placeholder="Write assignment description..."
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>

              <div className="pdf-replace-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="current-pdf-panel">
                  <label className="form-label">Current PDF Document</label>
                  <div className="pdf-info-card" style={{ padding: "16px", background: "var(--bg-subtle)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
                    <FileText size={24} color="#2563eb" style={{ marginBottom: "6px" }} />
                    <h4 style={{ fontSize: "14px", fontWeight: 700 }}>{currentPdf?.originalname || "PDF Document"}</h4>
                    {currentPdf?.url && (
                      <a href={currentPdf.url} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline" style={{ marginTop: "8px", display: "inline-flex" }}>
                        <Eye size={14} /> View PDF
                      </a>
                    )}
                  </div>
                </div>

                <div className="replace-pdf-panel">
                  <label className="form-label">Replace PDF (Optional)</label>
                  <label htmlFor="assignmentPdf" className="dropzone-box" style={{ padding: "20px" }}>
                    {!file ? (
                      <div className="dropzone-empty-content">
                        <UploadCloud size={24} color="#2563eb" />
                        <span className="dropzone-title" style={{ fontSize: "13px" }}>Select New PDF</span>
                      </div>
                    ) : (
                      <div style={{ textAlign: "center" }}>
                        <span style={{ fontSize: "13px", fontWeight: 700, display: "block" }}>{file.name}</span>
                        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Click to change file</span>
                      </div>
                    )}
                  </label>
                  <input
                    id="assignmentPdf"
                    type="file"
                    accept=".pdf"
                    hidden
                    onChange={handleFileChange}
                  />
                </div>
              </div>

              <div className="form-actions-row">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => navigate("/student/assignments")}
                >
                  Cancel
                </button>

                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? "Updating..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
};

export default StudentEditAssignment;
