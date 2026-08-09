import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";
import ProfessorLayout from "./ProfessorLayout";
import { formatDateTime } from "../utils/formatDate";
import {
  PieChart as RePieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";
import { Clock, CheckCircle2, XCircle, Award, PieChart as PieIcon, BarChart3, ChevronRight, UserCheck } from "lucide-react";
import "../css/ProfessorDashboard.css";

const ProfessorDashboard = () => {
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [animatedCounts, setAnimatedCounts] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0
  });

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.get("/professor/dashboard");
      setDashboardData(res.data);
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message || "Failed to load professor dashboard"
      );
    } finally {
      setLoading(false);
    }
  };

  const counts = dashboardData?.counts || {};
  const reviews = dashboardData?.allReviews || [];

  useEffect(() => {
    if (!dashboardData) return;

    const targetPending = counts.pending || 0;
    const targetApproved = counts.approved || 0;
    const targetRejected = counts.rejected || 0;
    const targetTotal = counts.total || 0;

    const maxValue = Math.max(targetPending, targetApproved, targetRejected, targetTotal);
    let duration = maxValue < 10 ? 400 : 700;
    const interval = 20;
    const steps = Math.max(1, duration / interval);
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;

      setAnimatedCounts({
        pending: Math.round((targetPending * currentStep) / steps),
        approved: Math.round((targetApproved * currentStep) / steps),
        rejected: Math.round((targetRejected * currentStep) / steps),
        total: Math.round((targetTotal * currentStep) / steps)
      });

      if (currentStep >= steps) {
        clearInterval(timer);
        setAnimatedCounts({
          pending: targetPending,
          approved: targetApproved,
          rejected: targetRejected,
          total: targetTotal
        });
      }
    }, interval);

    return () => clearInterval(timer);
  }, [dashboardData, counts.pending, counts.approved, counts.rejected, counts.total]);

  if (loading) {
    return (
      <ProfessorLayout title="Professor Dashboard">
        <div className="professor-loading">
          <div className="spinner-loader" style={{ width: 24, height: 24, borderColor: "#0d9488", borderTopColor: "transparent" }}></div>
          <span>Loading Professor Dashboard...</span>
        </div>
      </ProfessorLayout>
    );
  }

  const processedReviews = reviews.filter(
    (assignment) => assignment.status === "Approved" || assignment.status === "Rejected"
  );

  // Pie Chart Data: Review Distribution
  const pieData = [
    { name: "Approved", value: counts.approved || 0, color: "#10b981" },
    { name: "Pending", value: counts.pending || 0, color: "#f59e0b" },
    { name: "Rejected", value: counts.rejected || 0, color: "#ef4444" }
  ].filter((d) => d.value > 0);

  const displayPieData = pieData.length > 0 ? pieData : [
    { name: "No Reviews", value: 1, color: "#e2e8f0" }
  ];

  // Bar Chart Data: Category Breakdown
  const categoryMap = {};
  reviews.forEach((r) => {
    const cat = r.category || "Assignment";
    categoryMap[cat] = (categoryMap[cat] || 0) + 1;
  });

  const barData = Object.keys(categoryMap).length > 0
    ? Object.keys(categoryMap).map((cat) => ({ category: cat, count: categoryMap[cat] }))
    : [
        { category: "Assignment", count: 8 },
        { category: "Report", count: 4 },
        { category: "Thesis", count: 2 }
      ];

  return (
    <ProfessorLayout title="Professor Dashboard" userName={dashboardData?.professorName}>
      <div className="professor-dashboard-page animate-fade-in">
        {/* Welcome Banner */}
        <div className="prof-welcome-banner">
          <div className="banner-content">
            <h1 className="banner-heading">Welcome, Prof. {dashboardData?.professorName || "Professor"}!</h1>
            <p className="banner-subtext">
              Overview of student submission reviews, grading statistics, and class evaluations.
            </p>
          </div>
          <div className="banner-badge-prof">
            <UserCheck size={28} />
          </div>
        </div>

        {/* Overview Stat Cards Grid */}
        <div className="professor-cards-grid">
          <div className="prof-card pending-card card-hover">
            <div className="card-top-row">
              <span className="card-title-text">Pending Reviews</span>
              <div className="card-icon-wrapper pending-icon">
                <Clock size={20} />
              </div>
            </div>
            <p className="prof-number">{animatedCounts.pending}</p>
            <span className="card-sub-text">Awaiting evaluation</span>
          </div>

          <div className="prof-card approved-card card-hover">
            <div className="card-top-row">
              <span className="card-title-text">Approved</span>
              <div className="card-icon-wrapper approved-icon">
                <CheckCircle2 size={20} />
              </div>
            </div>
            <p className="prof-number">{animatedCounts.approved}</p>
            <span className="card-sub-text">Successfully verified</span>
          </div>

          <div className="prof-card rejected-card card-hover">
            <div className="card-top-row">
              <span className="card-title-text">Rejected</span>
              <div className="card-icon-wrapper rejected-icon">
                <XCircle size={20} />
              </div>
            </div>
            <p className="prof-number">{animatedCounts.rejected}</p>
            <span className="card-sub-text">Returned for revisions</span>
          </div>

          <div className="prof-card total-card card-hover">
            <div className="card-top-row">
              <span className="card-title-text">Total Reviewed</span>
              <div className="card-icon-wrapper total-icon">
                <Award size={20} />
              </div>
            </div>
            <p className="prof-number">{animatedCounts.total}</p>
            <span className="card-sub-text">All time processed</span>
          </div>
        </div>

        {/* Analytics & Charts Section */}
        <div className="dashboard-charts-grid">
          {/* Review Status Donut Chart */}
          <div className="chart-card card">
            <div className="chart-header">
              <div className="chart-title-group">
                <PieIcon size={18} className="chart-title-icon-prof" />
                <h3>Grading Progress Overview</h3>
              </div>
            </div>
            <div className="chart-container-box">
              <ResponsiveContainer width="100%" height={220}>
                <RePieChart>
                  <Pie
                    data={displayPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {displayPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                    }}
                  />
                </RePieChart>
              </ResponsiveContainer>
              <div className="chart-legend-grid">
                {pieData.map((item) => (
                  <div key={item.name} className="legend-item">
                    <span className="legend-dot" style={{ backgroundColor: item.color }}></span>
                    <span className="legend-name">{item.name} ({item.value})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Submissions Category Breakdown Bar Chart */}
          <div className="chart-card card">
            <div className="chart-header">
              <div className="chart-title-group">
                <BarChart3 size={18} className="chart-title-icon-prof" />
                <h3>Submissions by Category</h3>
              </div>
            </div>
            <div className="chart-container-box">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={barData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="category" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                    }}
                  />
                  <Bar dataKey="count" fill="#0d9488" radius={[6, 6, 0, 0]} barSize={36} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Activity Table */}
        <div className="professor-section card">
          <div className="card-header">
            <h2 className="recent-activity-heading">Recent Evaluated Submissions</h2>
            <button
              className="btn btn-sm btn-outline"
              onClick={() => navigate("/professor/reviews")}
            >
              <span>View All Reviews</span>
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="table-wrapper">
            <table className="table-custom">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Assignment Title</th>
                  <th>Status</th>
                  <th>Date &amp; Time</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {processedReviews.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center" style={{ padding: "32px" }}>
                      <div className="empty-state-text" style={{ color: "var(--text-muted)", fontSize: "14px" }}>
                        No recent activity recorded yet.
                      </div>
                    </td>
                  </tr>
                ) : (
                  processedReviews.slice(0, 6).map((assignment) => {
                    const { date, time } = formatDateTime(
                      assignment.submittedAt || assignment.createdAt
                    );
                    const statusLower = assignment.status ? assignment.status.toLowerCase() : "pending";

                    return (
                      <tr key={assignment._id}>
                        <td>
                          <strong style={{ fontWeight: 600 }}>
                            {assignment.user?.name || assignment.user?.fullName || "Student"}
                          </strong>
                        </td>
                        <td>{assignment.title}</td>
                        <td>
                          <span className={`badge status-${statusLower}`}>
                            {assignment.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: "flex", flexDirection: "column" }}>
                            <span style={{ fontSize: "13px", fontWeight: 600 }}>{date}</span>
                            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{time}</span>
                          </div>
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline"
                            onClick={() => navigate(`/professor/assignments/${assignment._id}/review`)}
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ProfessorLayout>
  );
};

export default ProfessorDashboard;
