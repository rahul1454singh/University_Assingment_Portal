import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import api from "../services/api";
import AdminLayout from "./AdminLayout";
import toast from "react-hot-toast";
import LogoutModal from "../components/LogoutModal";
import { Plus, Search, Pencil, Trash2, Users as UsersIcon, ChevronLeft, ChevronRight } from "lucide-react";
import "../css/Users.css";

import DepartmentCell from "../components/DepartmentCell";

const Users = () => {
  const [openPopoverId, setOpenPopoverId] = useState(null);
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
                      <DepartmentCell 
                        userId={user._id}
                        openPopoverId={openPopoverId}
                        setOpenPopoverId={setOpenPopoverId}
                        departments={
                          user.departments && user.departments.length > 0 
                            ? user.departments 
                            : user.department?.name 
                              ? [user.department] 
                              : []
                        } 
                      />
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
