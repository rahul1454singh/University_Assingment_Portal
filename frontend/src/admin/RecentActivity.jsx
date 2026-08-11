import React, { useEffect, useState } from "react";
import api from "../services/api";
import AdminLayout from "./AdminLayout";
import { formatDateTime } from "../utils/formatDate";
import { Activity, ChevronLeft, ChevronRight } from "lucide-react";
import "../css/AdminDashboard.css"; // Reuse dashboard styles for activity items

const RecentActivity = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchActivities();
  }, [currentPage]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/activities?page=${currentPage}&limit=${itemsPerPage}`);
      if (res.data && res.data.success) {
        setActivities(res.data.activities || []);
        if (res.data.totalPages) {
          setTotalPages(res.data.totalPages);
        }
      }
    } catch (err) {
      console.error("Activities load error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="Recent Activity">
      <div className="admin-dashboard-page animate-fade-in">
        <div className="page-header-row">
          <div className="page-title-group">
            <h1 className="page-heading">Recent University Activity</h1>
            <p className="page-subheading">Full log of administrative actions</p>
          </div>
        </div>

        <div className="content-box activity-box card">
          <div className="card-header">
            <div className="chart-title-group">
              <Activity size={18} className="chart-title-icon-admin" />
              <h3>Activity Log</h3>
            </div>
          </div>

          <div className="card-body">
            <div className="activity-list" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {loading ? (
                <p style={{ textAlign: "center", color: "var(--text-muted)", padding: "20px" }}>
                  Loading activities...
                </p>
              ) : activities.length === 0 ? (
                <p style={{ textAlign: "center", color: "var(--text-muted)", padding: "20px" }}>
                  No recent activity recorded.
                </p>
              ) : (
                activities.map((act) => {
                  const { date, time } = formatDateTime(act.createdAt);
                  return (
                    <div key={act._id} className="activity-item-card">
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

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="pagination-container" style={{ marginTop: "20px", borderTop: "1px solid var(--border-color)", paddingTop: "16px" }}>
                <span className="pagination-info">
                  Page {currentPage} of {totalPages}
                </span>
                <div className="pagination-buttons">
                  <button
                    className="btn btn-sm btn-outline"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    <ChevronLeft size={16} />
                    <span>Prev</span>
                  </button>
                  <button
                    className="btn btn-sm btn-outline"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    <span>Next</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default RecentActivity;
