import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import ProfessorLayout from "./ProfessorLayout";
import { formatDateTime } from "../utils/formatDate";
import { Award, ArrowLeft, Eye, Download, CheckCircle2, XCircle, User, Mail, Phone, FileText } from "lucide-react";
import "../css/ReviewAssignment.css";

function ReviewAssignment() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [assignment, setAssignment] = useState(null);
  const [professorInfo, setProfessorInfo] = useState({ name: "", email: "" });
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignment();
  }, [id]);

  const fetchAssignment = async () => {
    try {
      const res = await api.get(`/professor/assignments/${id}/review`);
      setAssignment(res.data?.assignment);
      setProfessorInfo({
        name: res.data?.professorName || "",
        email: res.data?.professorEmail || ""
      });
      if (
        res.data?.assignment?.rejectionRemarks ||
        res.data?.assignment?.remarks ||
        res.data?.assignment?.feedback
      ) {
        setRemarks(
          res.data.assignment.rejectionRemarks ||
            res.data.assignment.remarks ||
            res.data.assignment.feedback ||
            ""
        );
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load assignment");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    const pdfUrl = assignment?.file?.url;
    if (!pdfUrl) {
      toast.error("File URL not available");
      return;
    }

    try {
      const toastId = toast.loading("Downloading PDF...");
      const response = await fetch(pdfUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download =
        assignment.file?.originalname || `${assignment.title || "assignment"}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      toast.dismiss(toastId);
      toast.success("Download started!");
    } catch (err) {
      console.error(err);
      const link = document.createElement("a");
      link.href = pdfUrl;
      link.download = assignment?.file?.originalname || "assignment.pdf";
      link.target = "_blank";
      link.click();
    }
  };

  const submitDecision = async (status) => {
    if (remarks.trim().split(/\s+/).length > 300) {
      toast.error("Feedback must be within 300 words");
      return;
    }

    try {
      const res = await api.post(`/professor/assignments/${id}/decision`, {
        status,
        remarks
      });

      if (res.data) {
        toast.success(
          res.data.message || `Assignment ${status.toLowerCase()} successfully`
        );
        navigate("/professor/reviews");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update decision");
    }
  };

  if (loading) {
    return (
      <ProfessorLayout title="Review Assignment">
        <div className="form-page-container">
          <div className="card card-body text-center" style={{ padding: "40px" }}>
            Loading Assignment...
          </div>
        </div>
      </ProfessorLayout>
    );
  }

  if (!assignment) {
    return (
      <ProfessorLayout title="Review Assignment">
        <div className="form-page-container">
          <div className="card card-body text-center" style={{ padding: "40px" }}>
            Assignment not found.
          </div>
        </div>
      </ProfessorLayout>
    );
  }

  const isApproved = assignment.status === "Approved";
  const { date, time } = formatDateTime(
    assignment.createdAt || assignment.submittedAt
  );

  const studentName =
    assignment.user?.name || assignment.user?.fullName || "Unknown";
  const studentEmail = assignment.user?.email || "-";
  const studentPhone = assignment.user?.phone || "-";

  return (
    <ProfessorLayout title={isApproved ? "Assignment Details" : "Review Assignment"}>
      <div className="form-page-container animate-fade-in" style={{ maxWidth: "960px" }}>
        <div className="form-card card">
          <div className="card-header">
            <div className="card-header-title-group">
              <Award size={22} className="header-icon-admin" />
              <div>
                <h2 className="card-title">{isApproved ? "Assignment Details" : "Review Student Assignment"}</h2>
                <p className="card-subtitle">Title: <strong>{assignment.title}</strong></p>
              </div>
            </div>

            <button
              className="btn btn-sm btn-outline"
              onClick={() => navigate("/professor/reviews")}
            >
              <ArrowLeft size={16} />
              <span>Back to Reviews</span>
            </button>
          </div>

          <div className="card-body">
            {/* Student Information Block */}
            <div className="student-info-card" style={{ padding: "16px", background: "var(--bg-subtle)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "14.5px", fontWeight: 700, marginBottom: "10px", color: "var(--text-primary)" }}>
                Student Details
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px", fontSize: "13.5px" }}>
                <div><b>Name:</b> {studentName}</div>
                <div><b>Email:</b> {studentEmail}</div>
                <div><b>Contact:</b> {studentPhone}</div>
              </div>
            </div>

            {assignment.description && (
              <div className="form-group" style={{ marginBottom: "20px" }}>
                <label className="form-label">Assignment Description</label>
                <div style={{ padding: "12px 14px", background: "#ffffff", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", fontSize: "14px" }}>
                  {assignment.description}
                </div>
              </div>
            )}

            {/* PDF Preview Frame & Download buttons */}
            <div className="pdf-preview-box" style={{ marginBottom: "20px" }}>
              <label className="form-label" style={{ display: "block", marginBottom: "8px" }}>PDF Submission Preview</label>
              <iframe
                src={assignment.file?.url}
                title="Assignment PDF Preview"
                style={{ width: "100%", height: "460px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}
              />

              <div className="pdf-actions-row" style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                <a
                  href={assignment.file?.url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline"
                >
                  <Eye size={16} />
                  <span>View PDF in Full Window</span>
                </a>

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleDownloadPDF}
                >
                  <Download size={16} />
                  <span>Download PDF Document</span>
                </button>
              </div>
            </div>

            {/* Feedback & Decision Section */}
            {isApproved ? (
              <div className="form-group">
                <label className="form-label">Evaluated Feedback</label>
                <div style={{ padding: "14px", background: "var(--success-50)", border: "1px solid var(--success-100)", borderRadius: "var(--radius-md)", color: "var(--success-700)", fontWeight: 500 }}>
                  {remarks || "No feedback provided."}
                </div>
              </div>
            ) : (
              <div className="form-group">
                <label className="form-label">Enter Feedback Remarks (Max 300 words)</label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Enter constructive remarks for the student..."
                  className="form-textarea"
                  rows="4"
                />
              </div>
            )}

            {!isApproved && (
              <div className="form-actions-row" style={{ marginTop: "24px" }}>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => submitDecision("Rejected")}
                >
                  <XCircle size={18} />
                  <span>Reject Submission</span>
                </button>

                <button
                  type="button"
                  className="btn btn-success"
                  onClick={() => submitDecision("Approved")}
                >
                  <CheckCircle2 size={18} />
                  <span>Approve Submission</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProfessorLayout>
  );
}

export default ReviewAssignment;
