import React, { useState, memo } from "react";
import api from "../services/api";
import toast from "react-hot-toast";
import { Headphones, X, Send, Mail, Phone } from "lucide-react";
import "../css/ContactAdminModal.css";

const ContactAdminModal = memo(({ isOpen, onClose }) => {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error("Please enter a message before sending.");
      return;
    }

    setSending(true);
    try {
      const res = await api.post("/api/complaints", { message });
      if (res.data && res.data.success) {
        toast.success("Message sent to Admin successfully!");
        setMessage("");
        onClose();
      } else {
        toast.error(res.data?.message || "Failed to send message");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error sending message to Admin");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="contact-modal-overlay" onClick={onClose}>
      <div className="contact-modal-box card animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="card-header">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Headphones size={22} className="header-icon-admin" />
            <h2 className="card-title">Contact Administrator</h2>
          </div>
        </div>

        <div className="card-body">
          <div className="contact-info-card" style={{ padding: "14px 16px", background: "var(--bg-subtle)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)", marginBottom: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13.5px", marginBottom: "6px" }}>
              <Mail size={16} color="#2563eb" />
              <span><b>Admin Email:</b> admin@university.com</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13.5px" }}>
              <Phone size={16} color="#2563eb" />
              <span><b>Admin Phone:</b> +977 9864292613</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="admin-form">
            <div className="form-group">
              <label className="form-label" htmlFor="contact-message-input">Message / Ticket Description</label>
              <textarea
                id="contact-message-input"
                className="form-textarea"
                rows="4"
                placeholder="Type your message, inquiry, or complaint here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </div>

            <div className="form-actions-row">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={sending}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={sending}
              >
                <Send size={16} />
                <span>{sending ? "Sending..." : "Send Message"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
});

export default ContactAdminModal;
