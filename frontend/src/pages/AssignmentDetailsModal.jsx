import React, { memo } from "react";
import { FileText, X, ExternalLink, User, Mail, Phone, Award } from "lucide-react";
import "../css/AssignmentDetailsModal.css";

const AssignmentDetailsModal = memo(({ isOpen, onClose, assignment }) => {
  if (!isOpen || !assignment) return null;

  const statusLower = assignment.status ? assignment.status.toLowerCase() : "draft";
  const isReviewed = statusLower === "approved" || statusLower === "rejected";

  const profName = isReviewed
    ? assignment.reviewerName ||
      assignment.reviewerId?.fullName ||
      assignment.reviewerId?.name ||
      assignment.professor?.fullName ||
      assignment.professor?.name ||
      assignment.professorName ||
      "-"
    : "-";

  const profEmail = isReviewed
    ? assignment.reviewerId?.email ||
      assignment.professor?.email ||
      assignment.reviewerEmail ||
      assignment.professorEmail ||
      "-"
    : "-";

  const profPhone = isReviewed
    ? assignment.reviewerId?.phone ||
      assignment.professor?.phone ||
      assignment.reviewerPhone ||
      assignment.professorPhone ||
      "-"
    : "-";

  return (
    <div className="assignment-modal-overlay" onClick={onClose}>
      <div className="assignment-modal card animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="card-header" style={{ borderBottom: "1px solid var(--border-color)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <FileText size={22} className="header-icon-admin" />
            <h2 className="card-title">Assignment Details</h2>
          </div>
          <button type="button" className="btn btn-sm btn-outline btn-icon-only" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="card-body assignment-modal-body">
          <div className="detail-row">
            <span>Assignment Title</span>
            <strong className="detail-val-title">{assignment.title}</strong>
          </div>

          <div className="detail-row">
            <span>Category</span>
            <div>
              <span className="badge badge-info">
                {assignment.category || "Assignment"}
              </span>
            </div>
          </div>

          <div className="detail-row">
            <span>Description</span>
            <p className="detail-desc">{assignment.description || "No description available"}</p>
          </div>

          <div className="detail-row">
            <span>PDF File Attachment</span>
            <div className="pdf-row">
              <span className="pdf-filename">
                {assignment.file?.originalname || "No File"}
              </span>
              {assignment.file?.url && (
                <a
                  href={assignment.file.url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-sm btn-outline"
                >
                  <ExternalLink size={14} />
                  <span>View PDF</span>
                </a>
              )}
            </div>
          </div>

          <div className="detail-row">
            <span>Assigned Professor</span>
            <p>{profName}</p>
          </div>

          <div className="detail-row">
            <span>Professor Email</span>
            <p>{profEmail}</p>
          </div>

          <div className="detail-row">
            <span>Professor Contact</span>
            <p>{profPhone}</p>
          </div>

          <div className="detail-row">
            <span>Review Status</span>
            <div>
              <span className={`badge status-${statusLower}`}>
                {assignment.status}
              </span>
            </div>
          </div>

          <div className="detail-row">
            <span>Feedback Remarks</span>
            <p className="feedback-box-text">
              {assignment.rejectionRemarks ||
                assignment.remarks ||
                assignment.feedback ||
                "No feedback provided"}
            </p>
          </div>

          <div className="detail-row">
            <span>Uploaded Date</span>
            <p>
              {assignment.createdAt
                ? new Date(assignment.createdAt).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                  })
                : "-"}
            </p>
          </div>
        </div>

        <div className="card-footer">
          <button className="btn btn-primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
});

export default AssignmentDetailsModal;