import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StudentLayout from "./StudentLayout";
import api from "../services/api";
import toast from "react-hot-toast";
import { UploadCloud, FileText, X, ArrowLeft, CheckCircle2 } from "lucide-react";
import "../css/StudentUploadAssignment.css";

const StudentUploadAssignment = () => {
  const navigate = useNavigate();

  const [professors, setProfessors] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    professor: "",
    category: ""
  });

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const loadProfessors = async () => {
      try {
        const res = await api.get("/api/student/professors");
        if (mounted && res.data.success) {
          setProfessors(res.data.professors || []);
        }
      } catch (err) {
        console.error("Professor loading error:", err);
      }
    };

    loadProfessors();
    return () => {
      mounted = false;
    };
  }, []);

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

  const handleRemoveFile = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setFile(null);
    const fileInput = document.getElementById("assignmentPdf");
    if (fileInput) fileInput.value = "";
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
    if (!file) {
      toast.error("Please choose a PDF file.");
      return;
    }

    const uploadData = new FormData();
    uploadData.append("title", formData.title.trim());
    uploadData.append("description", formData.description.trim());
    uploadData.append("category", formData.category);
    uploadData.append("professor", formData.professor);
    uploadData.append("file", file);

    let loadingToast;
    try {
      setLoading(true);
      loadingToast = toast.loading("Uploading assignment...");

      const res = await api.post(
        "/api/student/assignments/upload",
        uploadData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );

      toast.dismiss(loadingToast);

      if (res.data && res.data.success) {
        toast.success("Assignment uploaded successfully!");
        setTimeout(() => {
          navigate("/student/assignments");
        }, 800);
      } else {
        toast.error(res.data.message || "Upload failed.");
      }
    } catch (err) {
      console.error(err);
      if (loadingToast) toast.dismiss(loadingToast);
      toast.error(err.response?.data?.message || "Error uploading assignment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <StudentLayout title="Upload Assignment">
      <div className="form-page-container animate-fade-in">
        <div className="form-card card">
          <div className="card-header">
            <div className="card-header-title-group">
              <UploadCloud size={22} className="header-icon-admin" />
              <div>
                <h2 className="card-title">Upload New Assignment</h2>
                <p className="card-subtitle">Submit your PDF document for professor review</p>
              </div>
            </div>
          </div>

          <div className="card-body">
            <form className="admin-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Assignment Title</label>
                <input
                  type="text"
                  name="title"
                  className="form-input"
                  placeholder="Enter descriptive title"
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
                  rows="4"
                  name="description"
                  className="form-textarea"
                  placeholder="Write details or summary of your submission..."
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>

              {/* Upload Dropzone */}
              <div className="form-group">
                <label className="form-label">Upload PDF Document</label>
                <label htmlFor="assignmentPdf" className={`dropzone-box ${file ? "has-file" : ""}`}>
                  {!file ? (
                    <div className="dropzone-empty-content">
                      <div className="dropzone-icon">
                        <UploadCloud size={36} />
                      </div>
                      <span className="dropzone-title">Click or drag PDF file here</span>
                      <span className="dropzone-sub">Maximum file size 10 MB</span>
                    </div>
                  ) : (
                    <div className="dropzone-file-selected">
                      <FileText size={32} className="file-icon" />
                      <div className="file-meta">
                        <span className="file-name">{file.name}</span>
                        <span className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                      </div>
                      <button
                        type="button"
                        className="btn btn-sm btn-danger"
                        onClick={handleRemoveFile}
                      >
                        <X size={14} />
                        <span>Remove</span>
                      </button>
                    </div>
                  )}
                </label>
                <input
                  id="assignmentPdf"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  hidden
                />
              </div>

              <div className="form-actions-row">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => navigate("/student/assignments/bulk-upload")}
                >
                  <UploadCloud size={16} />
                  <span>Switch to Bulk Upload</span>
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  <span>{loading ? "Uploading..." : "Submit Assignment"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
};

export default StudentUploadAssignment;
