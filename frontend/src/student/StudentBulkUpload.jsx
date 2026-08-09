import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StudentLayout from "./StudentLayout";
import api from "../services/api";
import toast from "react-hot-toast";
import { UploadCloud, FileText, X, ArrowLeft, CheckCircle2 } from "lucide-react";
import "../css/StudentBulkUpload.css";

const StudentBulkUpload = () => {
  const navigate = useNavigate();

  const [professors, setProfessors] = useState([]);
  const [formData, setFormData] = useState({
    professor: "",
    category: "",
    description: ""
  });

  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProfessors();
  }, []);

  const fetchProfessors = async () => {
    try {
      const res = await api.get("/api/student/professors");
      if (res.data && res.data.success) {
        setProfessors(res.data.professors || []);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load professors.");
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length === 0) {
      setFiles([]);
      return;
    }

    const invalidFile = selectedFiles.find(
      (file) =>
        file.type !== "application/pdf" &&
        !file.name.toLowerCase().endsWith(".pdf")
    );

    if (invalidFile) {
      toast.error("Only PDF files are allowed.");
      e.target.value = "";
      return;
    }

    const oversized = selectedFiles.find((file) => file.size > 10 * 1024 * 1024);
    if (oversized) {
      toast.error("Each PDF must be less than 10 MB.");
      e.target.value = "";
      return;
    }

    setFiles(selectedFiles);
  };

  const handleRemoveFile = (indexToRemove, e) => {
    e.preventDefault();
    e.stopPropagation();
    setFiles((prevFiles) => prevFiles.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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
    if (files.length === 0) {
      toast.error("Please select at least one PDF file.");
      return;
    }

    const uploadData = new FormData();
    uploadData.append("professor", formData.professor);
    uploadData.append("category", formData.category);
    uploadData.append("description", formData.description.trim());

    files.forEach((file) => {
      uploadData.append("files", file);
    });

    let loadingToast;
    try {
      setLoading(true);
      loadingToast = toast.loading("Uploading assignments...");

      const res = await api.post(
        "/api/student/assignments/bulk-upload",
        uploadData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );

      toast.dismiss(loadingToast);

      if (res.data && res.data.success) {
        toast.success("Assignments uploaded successfully!");
        setTimeout(() => {
          navigate("/student/assignments");
        }, 800);
      } else {
        toast.error(res.data.message || "Upload failed.");
      }
    } catch (err) {
      console.error(err);
      if (loadingToast) toast.dismiss(loadingToast);
      toast.error(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <StudentLayout title="Bulk Upload Assignments">
      <div className="form-page-container animate-fade-in">
        <div className="form-card card">
          <div className="card-header">
            <div className="card-header-title-group">
              <UploadCloud size={22} className="header-icon-admin" />
              <div>
                <h2 className="card-title">Bulk Upload PDF Assignments</h2>
                <p className="card-subtitle">Select multiple PDF files to upload in a single submission batch</p>
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
                <label className="form-label">Batch Description</label>
                <textarea
                  rows="3"
                  name="description"
                  className="form-textarea"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter details for this batch of assignments..."
                />
              </div>

              {/* Bulk Dropzone */}
              <div className="form-group">
                <label className="form-label">Upload Multiple PDF Files</label>
                <label htmlFor="bulkPdf" className={`dropzone-box ${files.length > 0 ? "has-file" : ""}`}>
                  {files.length === 0 ? (
                    <div className="dropzone-empty-content">
                      <div className="dropzone-icon">
                        <UploadCloud size={36} />
                      </div>
                      <span className="dropzone-title">Click to select multiple PDF files</span>
                      <span className="dropzone-sub">Maximum 10 MB per file</span>
                    </div>
                  ) : (
                    <div className="bulk-file-list-grid" onClick={(e) => e.stopPropagation()}>
                      <span style={{ fontSize: "13.5px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px", display: "block" }}>
                        {files.length} Files Selected:
                      </span>
                      {files.map((file, index) => (
                        <div key={index} className="bulk-file-chip">
                          <FileText size={16} color="#2563eb" />
                          <span className="chip-name">{file.name}</span>
                          <span className="chip-size">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                          <button
                            type="button"
                            className="chip-remove"
                            onClick={(e) => handleRemoveFile(index, e)}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </label>

                <input
                  id="bulkPdf"
                  type="file"
                  multiple
                  accept=".pdf"
                  hidden
                  onChange={handleFileChange}
                />
              </div>

              <div className="form-actions-row">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => navigate("/student/assignments/upload")}
                >
                  <FileText size={16} />
                  <span>Single Assignment Upload</span>
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  <span>{loading ? "Uploading All..." : `Upload All (${files.length})`}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
};

export default StudentBulkUpload;
