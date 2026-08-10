import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import StudentLayout from "./StudentLayout";
import AssignmentDetailsModal from "../pages/AssignmentDetailsModal";
import LogoutModal from "../components/LogoutModal";
import { formatDateTime } from "../utils/formatDate";
import toast from "react-hot-toast";
import { Plus, UploadCloud, Eye, Pencil, Trash2, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import "../css/StudentAssignments.css";

const StudentAssignments = () => {
  const navigate = useNavigate();

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const res = await api.get("/api/student/assignments");
      if (res.data.success) {
        setAssignments(res.data.assignments || []);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load assignments");
    } finally {
      setLoading(false);
    }
  };

  const handleDetails = async (id) => {
    const localTarget = assignments.find((item) => item._id === id);
    if (localTarget) {
      setSelectedAssignment(localTarget);
    }
    setShowModal(true);

    try {
      const res = await api.get(`/api/student/assignments/${id}`);
      if (res.data && res.data.success && res.data.assignment) {
        setSelectedAssignment(res.data.assignment);
      }
    } catch (err) {
      console.error("Fetch assignment details error:", err);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedAssignment(null);
  };

  const promptDelete = (assignment) => {
    if (
      assignment.status === "Submitted" ||
      assignment.status === "Approved"
    ) {
      return;
    }
    setDeleteTarget(assignment);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      const res = await api.post(
        `/student/assignments/${deleteTarget._id}/delete`
      );

      if (res.data.success) {
        toast.success("Assignment deleted successfully");
        fetchAssignments();
      } else {
        toast.error(res.data.message || "Failed to delete assignment.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete assignment.");
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleSubmitAssignment = async (assignment) => {
    try {
      const toastId = toast.loading("Submitting assignment...");
      const res = await api.post(`/api/student/assignments/${assignment._id}/submit`, {
        reviewerId: assignment.reviewerId?._id || assignment.professor
      });
      toast.dismiss(toastId);
      if (res.data.success) {
        toast.success("Assignment submitted successfully");
        fetchAssignments();
      } else {
        toast.error(res.data.message || "Failed to submit assignment");
      }
    } catch (err) {
      toast.dismiss();
      toast.error(err.response?.data?.message || "Failed to submit assignment");
    }
  };

  // Pagination Logic
  const totalPages = Math.ceil(assignments.length / pageSize) || 1;
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const currentAssignments = assignments.slice(startIndex, startIndex + pageSize);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <>
      <StudentLayout title="Student Assignments">
        <div className="assignments-page animate-fade-in">
          {/* Header Title & Actions */}
          <div className="page-header-row">
            <div className="page-title-group">
              <h1 className="page-heading">My Submissions</h1>
              <p className="page-subheading">View, edit, and upload your university assignment PDFs</p>
            </div>

            <div className="header-actions-flex" style={{ display: "flex", gap: "10px" }}>
              <button
                className="btn btn-secondary"
                onClick={() => navigate("/student/assignments/bulk-upload")}
              >
                <UploadCloud size={18} />
                <span>Bulk Upload</span>
              </button>
              <button
                className="btn btn-primary"
                onClick={() => navigate("/student/assignments/upload")}
              >
                <Plus size={18} />
                <span>Upload Assignment</span>
              </button>
            </div>
          </div>

          {/* Table Card Container */}
          <div className="table-wrapper card">
            <table className="table-custom">
              <thead>
                <tr>
                  <th>Assignment Title</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Feedback Remarks</th>
                  <th>Submitted Date</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center" style={{ padding: "32px" }}>
                      Loading assignments...
                    </td>
                  </tr>
                ) : assignments.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="empty-cell">
                      <div className="empty-state">
                        <div className="empty-state-icon">
                          <FileText size={24} />
                        </div>
                        <p className="empty-state-title">No assignments found</p>
                        <p className="empty-state-desc">You haven't uploaded any assignments yet.</p>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => navigate("/student/assignments/upload")}
                        >
                          <Plus size={16} />
                          <span>Upload Assignment Now</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentAssignments.map((assignment) => {
                    const canEdit =
                      assignment.status === "Draft" ||
                      assignment.status === "Rejected";

                    const canDelete =
                      assignment.status === "Draft" ||
                      assignment.status === "Rejected";

                    const statusLower = assignment.status
                      ? assignment.status.toLowerCase()
                      : "draft";

                    const canSubmit = statusLower === "draft" || statusLower === "rejected";

                    const feedbackText =
                      assignment.rejectionRemarks ||
                      assignment.remarks ||
                      assignment.feedback;

                    const { date, time } = formatDateTime(
                      assignment.createdAt || assignment.submittedAt
                    );

                    const statusLower = assignment.status
                      ? assignment.status.toLowerCase()
                      : "draft";

                    const fileName = assignment.file?.originalname || "";
                    const ext = fileName.split(".").pop()?.toUpperCase() || "PDF";
                    const fileTypeLabel = ext ? `${ext} Document` : "PDF Document";

                    return (
                      <tr key={assignment._id}>
                        <td>
                          <div style={{ display: "flex", flexDirection: "column" }}>
                            <strong style={{ fontSize: "14.5px", fontWeight: 700 }}>
                              {assignment.title}
                            </strong>
                            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                              {fileTypeLabel}
                            </span>
                          </div>
                        </td>

                        <td>
                          <span className="badge badge-info">
                            {assignment.category || "Assignment"}
                          </span>
                        </td>

                        <td>
                          <span className={`badge status-${statusLower}`}>
                            {assignment.status || "Draft"}
                          </span>
                        </td>

                        <td>
                          {feedbackText ? (
                            <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{feedbackText}</span>
                          ) : (
                            <span style={{ fontSize: "12.5px", color: "var(--text-light)" }}>No feedback</span>
                          )}
                        </td>

                        <td>
                          <div style={{ display: "flex", flexDirection: "column" }}>
                            <span style={{ fontSize: "13px", fontWeight: 600 }}>{date}</span>
                            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{time}</span>
                          </div>
                        </td>

                        <td className="text-right">
                          <div className="table-actions-group">
                            <button
                              className="btn btn-sm btn-primary"
                              disabled={!canSubmit}
                              onClick={() => canSubmit && handleSubmitAssignment(assignment)}
                            >
                              <UploadCloud size={14} />
                              <span>Submitted</span>
                            </button>

                            <button
                              className="btn btn-sm btn-outline"
                              onClick={() => handleDetails(assignment._id)}
                            >
                              <Eye size={14} />
                              <span>Details</span>
                            </button>

                            <button
                              className="btn btn-sm btn-outline"
                              disabled={!canEdit}
                              onClick={() =>
                                canEdit &&
                                navigate(
                                  `/student/assignments/${assignment._id}/edit`
                                )
                              }
                            >
                              <Pencil size={14} />
                              <span>Edit</span>
                            </button>

                            <button
                              className="btn btn-sm btn-danger"
                              disabled={!canDelete}
                              onClick={() => promptDelete(assignment)}
                            >
                              <Trash2 size={14} />
                              <span>Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            {/* Pagination Footer */}
            {assignments.length > 0 && (
              <div className="pagination-container">
                <span className="pagination-info">
                  Page {safeCurrentPage} of {totalPages}
                </span>
                <div className="pagination-buttons">
                  <button
                    className="btn btn-sm btn-outline"
                    disabled={safeCurrentPage <= 1}
                    onClick={() => handlePageChange(safeCurrentPage - 1)}
                  >
                    <ChevronLeft size={16} />
                    <span>Prev</span>
                  </button>

                  <button
                    className="btn btn-sm btn-outline"
                    disabled={safeCurrentPage >= totalPages}
                    onClick={() => handlePageChange(safeCurrentPage + 1)}
                  >
                    <span>Next</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </StudentLayout>

      <AssignmentDetailsModal
        isOpen={showModal}
        assignment={selectedAssignment}
        onClose={closeModal}
      />

      <LogoutModal
        isOpen={!!deleteTarget}
        title="Delete Assignment"
        message="Are you sure you want to delete this assignment? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </>
  );
};

export default StudentAssignments;
