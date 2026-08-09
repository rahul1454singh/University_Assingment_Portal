import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";
import ProfessorLayout from "./ProfessorLayout";
import { formatDateTime } from "../utils/formatDate";
import { Award, Eye, Pencil, ChevronLeft, ChevronRight } from "lucide-react";
import "../css/ProfessorReviews.css";

const ProfessorReviews = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await api.get("/professor/dashboard");
      const allReviews = res.data?.allReviews || [];
      setReviews(allReviews);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  const calculateDaysAgo = (dateStr) => {
    if (!dateStr) return "0 Days";
    const submitted = new Date(dateStr);
    const today = new Date();

    const submittedDateOnly = new Date(
      submitted.getFullYear(),
      submitted.getMonth(),
      submitted.getDate()
    );
    const todayDateOnly = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    const diffTime = todayDateOnly - submittedDateOnly;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "1 Day Ago";
    } else {
      return `${diffDays} Days Ago`;
    }
  };

  return (
    <ProfessorLayout title="My Reviews">
      <div className="professor-reviews-container animate-fade-in">
        {/* Page Header */}
        <div className="page-header-row">
          <div className="page-title-group">
            <h1 className="page-heading">Student Submissions Directory</h1>
            <p className="page-subheading">Evaluate, review, approve or reject student assignments</p>
          </div>
          <span className="badge badge-success" style={{ fontSize: "13px", padding: "6px 14px" }}>
            {reviews.length} Total Assigned
          </span>
        </div>

        {/* Data Table Container */}
        <div className="table-wrapper card">
          {loading ? (
            <div className="professor-loading" style={{ padding: "40px" }}>Loading reviews...</div>
          ) : (
            <table className="table-custom">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Category</th>
                  <th>Description / Title</th>
                  <th>Submitted Date</th>
                  <th>Age</th>
                  <th>Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {reviews.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="empty-cell">
                      <div className="empty-state">
                        <div className="empty-state-icon">
                          <Award size={24} />
                        </div>
                        <p className="empty-state-title">No assigned reviews found</p>
                        <p className="empty-state-desc">Submissions assigned to you will appear here.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  reviews.map((assignment) => {
                    const submittedDate =
                      assignment.submittedAt || assignment.createdAt;
                    const daysAgoText = calculateDaysAgo(submittedDate);

                    const isApproved = assignment.status === "Approved";
                    const statusLower = assignment.status ? assignment.status.toLowerCase() : "pending";

                    const { date, time } = formatDateTime(submittedDate);

                    return (
                      <tr key={assignment._id}>
                        <td>
                          <strong style={{ fontWeight: 700 }}>
                            {assignment.user?.name ||
                              assignment.user?.fullName ||
                              "Unknown"}
                          </strong>
                        </td>

                        <td>
                          <span className="badge badge-info">
                            {assignment.category ||
                              assignment.assignmentType ||
                              "Assignment"}
                          </span>
                        </td>

                        <td>
                          <span style={{ fontSize: "13.5px", color: "var(--text-primary)" }}>
                            {assignment.description ||
                              assignment.title ||
                              "No description provided"}
                          </span>
                        </td>

                        <td>
                          <div style={{ display: "flex", flexDirection: "column" }}>
                            <span style={{ fontSize: "13px", fontWeight: 600 }}>{date}</span>
                            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{time}</span>
                          </div>
                        </td>

                        <td>
                          <span style={{ fontSize: "12.5px", color: "var(--text-muted)", fontWeight: 500 }}>
                            {daysAgoText}
                          </span>
                        </td>

                        <td>
                          <span className={`badge status-${statusLower}`}>
                            {assignment.status}
                          </span>
                        </td>

                        <td className="text-right">
                          <div className="table-actions-group">
                            {isApproved ? (
                              <button
                                className="btn btn-sm btn-outline"
                                onClick={() =>
                                  navigate(
                                    `/professor/assignments/${assignment._id}/review`
                                  )
                                }
                              >
                                <Eye size={14} />
                                <span>Details</span>
                              </button>
                            ) : (
                              <button
                                className="btn btn-sm btn-primary"
                                onClick={() =>
                                  navigate(
                                    `/professor/assignments/${assignment._id}/review`
                                  )
                                }
                              >
                                <Pencil size={14} />
                                <span>Review</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </ProfessorLayout>
  );
};

export default ProfessorReviews;
