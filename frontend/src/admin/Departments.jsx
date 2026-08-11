import React, { useEffect, useState } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import toast from "react-hot-toast";
import LogoutModal from "../components/LogoutModal";
import { Plus, Search, Filter, Pencil, Trash2, Building2, ChevronLeft, ChevronRight } from "lucide-react";
import "../css/Departments.css";

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteDeptId, setDeleteDeptId] = useState(null);
  const itemsPerPage = 6;

  const loadDepartments = async () => {
    try {
      const res = await api.get(`/admin/departments?page=${currentPage}&limit=${itemsPerPage}&q=${search}&type=${type}`);
      setDepartments(res.data.departments || []);
      if (res.data.totalPages) {
        setTotalPages(res.data.totalPages);
      }
    } catch (err) {
      console.error("API ERROR:", err);
      setError("Failed to load departments");
    }
  };

  useEffect(() => {
    loadDepartments();
  }, [currentPage, search, type]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, type]);

  const confirmDeleteDepartment = async () => {
    if (!deleteDeptId) return;

    try {
      await api.delete(`/admin/departments/${deleteDeptId}`);
      toast.success("Department deleted successfully");
      loadDepartments();
    } catch (err) {
      const msg = err.response?.data?.message || "Delete failed";
      toast.error(msg);
    } finally {
      setDeleteDeptId(null);
    }
  };

  const currentDepartments = departments;

  return (
    <AdminLayout title="Departments Management">
      <div className="department-page animate-fade-in">
        {/* Header Title & Actions */}
        <div className="page-header-row">
          <div className="page-title-group">
            <h1 className="page-heading">Departments Directory</h1>
          </div>
          <Link to="/admin/departments/create" className="btn btn-primary">
            <Plus size={18} />
            <span>Create Department</span>
          </Link>
        </div>

        {error && <div className="auth-alert-error">{error}</div>}

        {/* Filter Controls Bar */}
        <div className="filter-controls-card card">
          <div className="search-input-wrapper input-icon-wrapper">
            <Search size={18} className="input-icon" />
            <input
              type="text"
              className="form-input"
              placeholder="Search department by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="filter-dropdown-wrapper">
            <Filter size={18} className="filter-icon" />
            <select
              className="form-select"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="">All Program Types</option>
              <option value="UG">Undergraduate (UG)</option>
              <option value="PG">Postgraduate (PG)</option>
              <option value="Research">Research</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="table-wrapper">
          <table className="table-custom">
            <thead>
              <tr>
                <th>Department Name</th>
                <th>Program Type</th>
                <th>Address / Location</th>
                <th>Users Enrolled</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {currentDepartments.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-cell">
                    <div className="empty-state">
                      <div className="empty-state-icon">
                        <Building2 size={24} />
                      </div>
                      <p className="empty-state-title">No departments found</p>
                      <p className="empty-state-desc">Try clearing your search query or create a new department.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentDepartments.map((dep) => (
                  <tr key={dep._id}>
                    <td>
                      <strong className="dep-name-text">{dep.name}</strong>
                    </td>
                    <td>
                      <span className="badge badge-info">{dep.type}</span>
                    </td>
                    <td>{dep.address || "-"}</td>
                    <td>
                      <span className="badge badge-neutral">{dep.userCount || 0} users</span>
                    </td>
                    <td className="text-right">
                      <div className="table-actions-group">
                        <Link
                          className="btn btn-sm btn-outline"
                          to={`/admin/departments/edit/${dep._id}`}
                        >
                          <Pencil size={14} />
                          <span>Edit</span>
                        </Link>

                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => setDeleteDeptId(dep._id)}
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
          isOpen={!!deleteDeptId}
          title="Delete Department"
          message="Are you sure you want to delete this department? This action cannot be undone."
          confirmText="Delete Department"
          cancelText="Cancel"
          onClose={() => setDeleteDeptId(null)}
          onConfirm={confirmDeleteDepartment}
        />
      </div>
    </AdminLayout>
  );
};

export default Departments;
