import React from "react";
import { formatDateTime } from "../utils/formatDate";
import { FileText } from "lucide-react";

const RecentSubmissionTable = ({ recent }) => {
  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Recent Submissions</h2>
      </div>

      <div className="table-wrapper" style={{ border: "none", borderRadius: 0 }}>
        <table className="table-custom">
          <thead>
            <tr>
              <th>Assignment Title</th>
              <th>Status</th>
              <th>Date &amp; Time</th>
            </tr>
          </thead>

          <tbody>
            {recent && recent.length > 0 ? (
              recent.map((item) => {
                const { date, time } = formatDateTime(item.createdAt || item.submittedAt);
                const statusLower = item.status ? item.status.toLowerCase() : "draft";

                return (
                  <tr key={item._id}>
                    <td>
                      <strong style={{ fontWeight: 700 }}>{item.title}</strong>
                    </td>

                    <td>
                      <span className={`badge status-${statusLower}`}>
                        {item.status || "Draft"}
                      </span>
                    </td>

                    <td>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontSize: "13px", fontWeight: 600 }}>{date}</span>
                        <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{time}</span>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="3" className="empty-cell">
                  <div className="empty-state">
                    <div className="empty-state-icon">
                      <FileText size={24} />
                    </div>
                    <p className="empty-state-title">No recent submissions found</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentSubmissionTable;