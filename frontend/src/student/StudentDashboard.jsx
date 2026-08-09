import React, { useEffect, useState } from "react";
import api from "../services/api";
import StudentLayout from "./StudentLayout";
import StudentCards from "./StudentCards";
import RecentSubmissionTable from "./RecentSubmissionTable";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";
import { PieChart as PieIcon, TrendingUp, Award } from "lucide-react";
import "../css/StudentDashboard.css";

const StudentDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.get("/api/student/dashboard");
      setDashboardData(res.data);
    } catch (err) {
      console.error("Student dashboard error:", err);
    }
  };

  const studentName = dashboardData?.user?.name || "Student";
  const counts = dashboardData?.counts || {};

  // Status Distribution Chart Data
  const pieData = [
    { name: "Approved", value: counts.Approved || 0, color: "#10b981" },
    { name: "Submitted", value: counts.Submitted || 0, color: "#f59e0b" },
    { name: "Rejected", value: counts.Rejected || 0, color: "#ef4444" },
    { name: "Draft", value: counts.Draft || 0, color: "#64748b" }
  ].filter((item) => item.value > 0);

  // If no data yet, provide placeholder for visual completeness
  const displayPieData = pieData.length > 0 ? pieData : [
    { name: "No Submissions", value: 1, color: "#e2e8f0" }
  ];

  // Activity Trend Chart Data
  const recentSubmissions = dashboardData?.recent || [];
  const trendMap = {};
  recentSubmissions.forEach((item) => {
    const d = new Date(item.createdAt || item.submittedAt || Date.now());
    const month = d.toLocaleString("en-US", { month: "short" });
    trendMap[month] = (trendMap[month] || 0) + 1;
  });

  const trendData = Object.keys(trendMap).length > 0
    ? Object.keys(trendMap).map((m) => ({ month: m, submissions: trendMap[m] }))
    : [
        { month: "Jan", submissions: 2 },
        { month: "Feb", submissions: 4 },
        { month: "Mar", submissions: 3 },
        { month: "Apr", submissions: 6 },
        { month: "May", submissions: 5 }
      ];

  return (
    <StudentLayout
      title="Student Dashboard"
      userName={studentName}
    >
      <div className="student-dashboard-page animate-fade-in">
        {/* Welcome Header Card */}
        <div className="dashboard-welcome-banner">
          <div className="banner-content">
            <h1 className="banner-heading">Welcome Back, {studentName}!</h1>
            <p className="banner-subtext">
              Track your assignment submissions, review deadlines, and monitor your academic progress.
            </p>
          </div>
          <div className="banner-badge">
            <Award size={28} />
          </div>
        </div>

        {/* Statistics Cards */}
        <StudentCards counts={dashboardData?.counts} />

        {/* Charts & Analytics Row */}
        <div className="dashboard-charts-grid">
          {/* Status Pie/Donut Chart */}
          <div className="chart-card card">
            <div className="chart-header">
              <div className="chart-title-group">
                <PieIcon size={18} className="chart-title-icon" />
                <h3>Submission Status Distribution</h3>
              </div>
            </div>
            <div className="chart-container-box">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
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
                </PieChart>
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

          {/* Submission Trend Area Chart */}
          <div className="chart-card card">
            <div className="chart-header">
              <div className="chart-title-group">
                <TrendingUp size={18} className="chart-title-icon" />
                <h3>Assignment Activity Trend</h3>
              </div>
            </div>
            <div className="chart-container-box">
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={trendData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSubmissions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="submissions"
                    stroke="#2563eb"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorSubmissions)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Submissions */}
        <RecentSubmissionTable recent={dashboardData?.recent} />
      </div>
    </StudentLayout>
  );
};

export default StudentDashboard;
