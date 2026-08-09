import React, { memo } from "react";
import { LogOut, AlertTriangle } from "lucide-react";
import "../css/LogoutModal.css";

const LogoutModal = memo(({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure you want to logout?",
  message = "This action will sign you out of your current session.",
  confirmText = "Yes",
  cancelText = "Cancel"
}) => {
  if (!isOpen) return null;

  return (
    <div className="logout-modal-overlay" onClick={onClose}>
      <div className="logout-modal-box card animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="card-body text-center" style={{ padding: "32px 24px" }}>
          <div className="logout-icon-wrapper">
            <LogOut size={28} color="#ef4444" />
          </div>

          <h2 className="logout-modal-title">{title}</h2>
          <p className="logout-modal-message">{message}</p>

          <div className="logout-modal-buttons">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              {cancelText}
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={onConfirm}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default LogoutModal;
