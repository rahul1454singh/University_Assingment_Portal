import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import AdminLayout from "./AdminLayout";
import toast from "react-hot-toast";
import LogoutModal from "../components/LogoutModal";
import { Plus, Search, Pencil, Trash2, Users as UsersIcon, ChevronLeft, ChevronRight } from "lucide-react";
import "../css/Users.css";

const DepartmentCell = ({ departments }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!departments || departments.length === 0) return <span>-</span>;

  if (departments.length === 1) {
    return (
      <span className="badge badge-neutral" style={{ fontSize: '11px', whiteSpace: 'nowrap' }}>
        {departments[0].name || departments[0]}
      </span>
    );
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'nowrap' }}>
        <span className="badge badge-neutral" style={{ fontSize: '11px', whiteSpace: 'nowrap', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', display: 'inline-block' }}>
          {departments[0].name || departments[0]}
        </span>
        <button
          onClick={() => setIsOpen(!isOpen)}
          title="View all departments"
          style={{
            background: 'none',
            border: 'none',
            color: '#2563eb',
            fontSize: '11px',
            cursor: 'pointer',
            padding: '2px 4px',
            fontWeight: '600',
            whiteSpace: 'nowrap',
            borderRadius: '4px'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#eff6ff'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
        >
          +{departments.length - 1} more {isOpen ? '▴' : '▾'}
        </button>
      </div>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          marginTop: '6px',
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
          padding: '10px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          minWidth: '220px',
          maxWidth: '300px'
        }}>
          <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', paddingBottom: '4px', borderBottom: '1px solid #f1f5f9' }}>
            Enrolled Departments
          </div>
          {departments.slice(1).map((dep, idx) => (
            <span key={idx} className="badge badge-neutral" style={{ fontSize: '11px', whiteSpace: 'normal', textAlign: 'left', lineHeight: '1.4' }}>
              {dep.name || dep}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

const Users = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteUserId, setDeleteUserId] = useState(null);
  const usersPerPage = 6;

  const [currentPage, setCurrentPage] = useState(1);
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage) || 1;

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const data = users.filter(
      (user) =>
        (user.name && user.name.toLowerCase().includes(search.toLowerCase())) ||
        (user.email && user.email.toLowerCase().includes(search.toLowerCase()))
    );

    setFilteredUsers(data);
    setCurrentPage(1);
  }, [search, users]);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/admin/users");
      const list = res.data.users || [];
      setUsers(list);
      setFilteredUsers(list);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteUser = async () => {
    if (!deleteUserId) return;

    try {
      await api.delete(`/admin/users/${deleteUserId}`);
      toast.success("User deleted successfully");
      fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    } finally {
      setDeleteUserId(null);
    }
  };

  const getRoleBadgeClass = (role) => {
    const r = role ? role.toLowerCase() : "student";
    if (r === "admin") return "badge-danger";
    if (r === "professor") return "badge-success";
    return "badge-info";
  };

  return (
    <AdminLayout title="Users Management">
      <div className="users-page animate-fade-in">
        {/* Header Title & Actions */}
        <div className="page-header-row">
          <div className="page-title-group">
            <h1 className="page-heading">User Directory</h1>
          </div>
          <Link to="/admin/users/create" className="btn btn-primary">
            <Plus size={18} />
            <span>Create User</span>
          </Link>
        </div>

        {/* Filter Controls Bar */}
        <div className="filter-controls-card card">
          <div className="search-input-wrapper input-icon-wrapper">
            <Search size={18} className="input-icon" />
            <input
              type="text"
              className="form-input"
              placeholder="Search user by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="table-wrapper">
          <table className="table-custom">
            <thead>
              <tr>
                <th>User Name</th>
                <th>Email Address</th>
                <th>Phone Number</th>
                <th>Department</th>
                <th>Role</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center" style={{ padding: "32px" }}>
                    <div className="table-loading-text" style={{ color: "var(--text-muted)", fontSize: "14px" }}>
                      Loading users directory...
                    </div>
                  </td>
                </tr>
              ) : currentUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-cell">
                    <div className="empty-state">
                      <div className="empty-state-icon">
                        <UsersIcon size={24} />
                      </div>
                      <p className="empty-state-title">No users found</p>
                      <p className="empty-state-desc">Try clearing your search filters or add a new user.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentUsers.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <strong className="user-name-text">{user.name}</strong>
                    </td>
                    <td>{user.email}</td>
                    <td>{user.phone || "-"}</td>
                    <td>
                      <DepartmentCell departments={
                        user.departments && user.departments.length > 0 
                          ? user.departments 
                          : user.department?.name 
                            ? [user.department] 
                            : []
                      } />
                    </td>
                    <td>
                      <span className={`badge ${getRoleBadgeClass(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="table-actions-group">
                        <Link
                          className="btn btn-sm btn-outline"
                          to={`/admin/users/edit/${user._id}`}
                        >
                          <Pencil size={14} />
                          <span>Edit</span>
                        </Link>

                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => setDeleteUserId(user._id)}
                        >
                          <Trash2 size={14} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="pagination-container">
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

        <LogoutModal
          isOpen={!!deleteUserId}
          title="Delete User Account"
          message="Are you sure you want to delete this user? This action will terminate their portal access."
          confirmText="Delete User"
          cancelText="Cancel"
          onClose={() => setDeleteUserId(null)}
          onConfirm={confirmDeleteUser}
        />
      </div>
    </AdminLayout>
  );
};

export default Users;
