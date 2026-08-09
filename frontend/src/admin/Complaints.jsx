import React, { useEffect, useState } from "react";
import api from "../services/api";
import toast from "react-hot-toast";
import AdminLayout from "./AdminLayout";
import { formatDateTime } from "../utils/formatDate";
import { MessageSquareWarning, Search, Mail, Clock, CheckCircle2 } from "lucide-react";
import "../css/Complaints.css";

const Complaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComplaints();
    markComplaintsAsRead();
  }, []);

  const fetchComplaints = async () => {
    try {
      const res = await api.get("/api/admin/complaints");
      if (res.data && res.data.success) {
        setComplaints(res.data.complaints || []);
      }
    } catch (err) {
      console.error("Fetch complaints error:", err);
      toast.error("Failed to load complaints");
    } finally {
      setLoading(false);
    }
  };

  const markComplaintsAsRead = async () => {
    try {
      await api.put("/api/admin/complaints/mark-read");
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await api.put(`/api/admin/complaints/${id}/status`, {
        status: newStatus
      });
      if (res.data && res.data.success) {
        toast.success(`Status updated to ${newStatus}`);
        setComplaints((prev) =>
          prev.map((c) => (c._id === id ? { ...c, status: newStatus } : c))
        );
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    }
  };

  return (
    <AdminLayout title="User Complaints">
      <div className="complaints-page animate-fade-in">
        {/* Header Title */}
        <div className="page-header-row">
          <div className="page-title-group">
            <h1 className="page-heading">User Complaints & Support Tickets</h1>
          </div>
          <span className="badge badge-info" style={{ fontSize: "13px", padding: "6px 14px" }}>
            {complaints.length} Total Complaints
          </span>
        </div>

        {/* Data Table */}
        <div className="table-wrapper">
          <table className="table-custom">
            <thead>
              <tr>
                <th>Sender Details</th>
                <th>Sender Email</th>
                <th>Complaint Message</th>
                <th>Date &amp; Time</th>
                <th>Status Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center" style={{ padding: "32px" }}>
                    Loading complaints...
                  </td>
                </tr>
              ) : complaints.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-cell">
                    <div className="empty-state">
                      <div className="empty-state-icon">
                        <MessageSquareWarning size={24} />
                      </div>
                      <p className="empty-state-title">No complaints submitted</p>
                      <p className="empty-state-desc">All student and professor inquiries have been cleared.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                complaints.map((item) => {
                  const { date, time } = formatDateTime(item.createdAt);
                  const statusLower = (item.status || "Pending").toLowerCase();
                  return (
                    <tr key={item._id}>
                      <td>
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                          <strong className="sender-name-text">
                            {item.senderName}
                          </strong>
                          <span className="badge badge-neutral" style={{ width: "fit-content", fontSize: "11px" }}>
                            {item.senderRole}
                          </span>
                        </div>
                      </td>

                      <td className="email-cell">{item.senderEmail}</td>

                      <td className="message-content-cell">
                        <div className="message-box-bubble">{item.message}</div>
                      </td>

                      <td>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <span style={{ fontSize: "13px", fontWeight: 600 }}>{date}</span>
                          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{time}</span>
                        </div>
                      </td>

                      <td>
                        <select
                          className={`form-select select-status-${statusLower}`}
                          value={item.status || "Pending"}
                          onChange={(e) =>
                            handleStatusChange(item._id, e.target.value)
                          }
                          style={{ padding: "6px 12px", fontSize: "13px", fontWeight: 600, width: "130px" }}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Read">Read</option>
                          <option value="Resolved">Resolved</option>
                        </select>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Complaints;
