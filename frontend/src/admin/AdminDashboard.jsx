import React, { useState, useEffect } from "react";
import api from "../services/api";
import AdminLayout from "./AdminLayout";
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
import { Building2, Users, GraduationCap, UserCheck, PieChart as PieIcon, BarChart3, Activity, Shield } from "lucide-react";
import "../css/AdminDashboard.css";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    departments: 0,
    users: 0,
    students: 0,
    professors: 0
  });

  const [animatedStats, setAnimatedStats] = useState({
    departments: 0,
    users: 0,
    students: 0,
    professors: 0
  });

  const [activities, setActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    loadDashboardStats();
    loadRecentActivities();
  }, []);

  useEffect(() => {
    const maxValue = Math.max(
      stats.departments,
      stats.users,
      stats.students,
      stats.professors
    );

    let duration = maxValue < 10 ? 400 : 700;
    const interval = 20;
    const steps = Math.max(1, duration / interval);
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;

      setAnimatedStats({
        departments: Math.round((stats.departments * currentStep) / steps),
        users: Math.round((stats.users * currentStep) / steps),
        students: Math.round((stats.students * currentStep) / steps),
        professors: Math.round((stats.professors * currentStep) / steps)
      });

      if (currentStep >= steps) {
        clearInterval(timer);
        setAnimatedStats({
          departments: stats.departments,
          users: stats.users,
          students: stats.students,
          professors: stats.professors
        });
      }
    }, interval);

    return () => clearInterval(timer);
  }, [stats]);

  const loadDashboardStats = async () => {
    try {
      const res = await api.get("/admin/dashboard/stats");
      if (res.data && res.data.stats) {
        setStats({
          departments: res.data.stats.departments || 0,
          users: res.data.stats.users || 0,
          students: res.data.stats.students || 0,
          professors: res.data.stats.professors || 0
        });
      }
    } catch (err) {
      console.error("Dashboard stats error:", err);
    }
  };

  const loadRecentActivities = async () => {
    try {
      const res = await api.get("/admin/activities");
      if (res.data && res.data.activities) {
        setActivities(res.data.activities || []);
      }
    } catch (err) {
      console.error("Activities load error:", err);
    } finally {
      setLoadingActivities(false);
    }
  };

  // Pie Chart Data: User Role Breakdown
  const userRoleData = [
    { name: "Students", value: stats.students || 0, color: "#0284c7" },
    { name: "Professors", value: stats.professors || 0, color: "#0d9488" }
  ].filter((d) => d.value > 0);

  const displayRoleData = userRoleData.length > 0 ? userRoleData : [
    { name: "No Users", value: 1, color: "#e2e8f0" }
  ];

  // Bar Chart Data: Platform Overview
  const platformOverviewData = [
    { label: "Departments", count: stats.departments || 0 },
    { label: "Total Users", count: stats.users || 0 },
    { label: "Students", count: stats.students || 0 },
    { label: "Professors", count: stats.professors || 0 }
  ];

  return (
    <AdminLayout title="University Admin Dashboard">
      <div className="admin-dashboard-page animate-fade-in">
        {/* Welcome Banner */}
        <div className="admin-welcome-banner">
          <div className="banner-content">
            <h1 className="banner-heading">System Administration Overview</h1>
          </div>
          <div className="banner-badge-admin">
            <Shield size={28} />
          </div>
        </div>

        {/* Overview Stat Cards Grid */}
        <div className="overview-cards-grid">
          <div className="admin-card departments-card card-hover">
            <div className="card-top-row">
              <span className="card-title-text">Total Departments</span>
              <div className="card-icon-wrapper dept-icon">
                <Building2 size={20} />
              </div>
            </div>
            <p className="card-number">{animatedStats.departments}</p>
            <span className="card-sub-text">Active academic units</span>
          </div>

          <div className="admin-card users-card card-hover">
            <div className="card-top-row">
              <span className="card-title-text">Total System Users</span>
              <div className="card-icon-wrapper users-icon">
                <Users size={20} />
              </div>
            </div>
            <p className="card-number">{animatedStats.users}</p>
            <span className="card-sub-text">Registered accounts</span>
          </div>

          <div className="admin-card students-card card-hover">
            <div className="card-top-row">
              <span className="card-title-text">Total Students</span>
              <div className="card-icon-wrapper student-icon">
                <GraduationCap size={20} />
              </div>
            </div>
            <p className="card-number">{animatedStats.students}</p>
            <span className="card-sub-text">Enrolled students</span>
          </div>

          <div className="admin-card professors-card card-hover">
            <div className="card-top-row">
              <span className="card-title-text">Total Professors</span>
              <div className="card-icon-wrapper prof-icon">
                <UserCheck size={20} />
              </div>
            </div>
            <p className="card-number">{animatedStats.professors}</p>
            <span className="card-sub-text">Faculty members</span>
          </div>
        </div>

        {/* Analytics & Charts Section */}
        <div className="dashboard-charts-grid">
          {/* User Role Distribution Chart */}
          <div className="chart-card card">
            <div className="chart-header">
              <div className="chart-title-group">
                <PieIcon size={18} className="chart-title-icon-admin" />
                <h3>User Role Distribution</h3>
              </div>
            </div>
            <div className="chart-container-box">
              <ResponsiveContainer width="100%" height={220}>
                <RePieChart>
                  <Pie
                    data={displayRoleData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {displayRoleData.map((entry, index) => (
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
                {userRoleData.map((item) => (
                  <div key={item.name} className="legend-item">
                    <span className="legend-dot" style={{ backgroundColor: item.color }}></span>
                    <span className="legend-name">{item.name} ({item.value})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Platform Stat Bar Chart */}
          <div className="chart-card card">
            <div className="chart-header">
              <div className="chart-title-group">
                <BarChart3 size={18} className="chart-title-icon-admin" />
                <h3>Platform Overview</h3>
              </div>
            </div>
            <div className="chart-container-box">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={platformOverviewData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                    }}
                  />
                  <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={36} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Activities Section */}
        <div className="content-box activity-box card">
          <div className="card-header">
            <div className="chart-title-group">
              <Activity size={18} className="chart-title-icon-admin" />
              <h3>Recent University Activity</h3>
            </div>
          </div>

          <div className="card-body">
            <div className="activity-list" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {loadingActivities ? (
                <p style={{ textAlign: "center", color: "var(--text-muted)", padding: "20px" }}>
                  Loading activities...
                </p>
              ) : activities.length === 0 ? (
                <p style={{ textAlign: "center", color: "var(--text-muted)", padding: "20px" }}>
                  No recent activity recorded.
                </p>
              ) : (
                (expanded ? activities : activities.slice(0, 4)).map((act) => {
                  const { date, time } = formatDateTime(act.createdAt);
                  return (
                    <div
                      key={act._id}
                      className="activity-item-card"
                    >
                      <div className="activity-left">
                        <div className="activity-dot"></div>
                        <div className="activity-details">
                          <strong className="activity-title-text">{act.title}</strong>
                          <p className="activity-desc">{act.description}</p>
                        </div>
                      </div>

                      <div className="activity-right">
                        <span className="activity-user">{act.userName || "System Admin"}</span>
                        <span className="activity-time">{date} • {time}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {!loadingActivities && activities.length > 4 && (
              <div style={{ textAlign: "center", marginTop: "20px" }}>
                <button
                  className="btn btn-sm btn-outline"
                  onClick={() => setExpanded(!expanded)}
                >
                  {expanded ? "Show Less ▲" : `View More (${activities.length - 4} more) ▼`}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
