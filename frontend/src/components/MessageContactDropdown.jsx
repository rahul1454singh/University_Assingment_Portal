import React, { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { formatProfessorName } from "../utils/nameHelper";

const MessageContactDropdown = ({
  placeholder,
  options,
  selectedId,
  onSelect,
  prefix = "",
  contactRole
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const selectedContact = options.find((c) => c._id === selectedId);

  const checkIsStudent = (c) => {
    if (contactRole === "student") return true;
    if (contactRole === "professor") return false;
    if (c && c.role && c.role.toLowerCase() === "student") return true;
    if (placeholder && placeholder.toLowerCase().includes("student")) return true;
    return false;
  };

  const getDeptText = (c) => {
    if (!c) return "General Department";
    if (c.departments && c.departments.length > 0) {
      if (c.departments.length <= 2) {
        return c.departments.join(", ");
      }
      return `${c.departments.slice(0, 2).join(", ")} +${c.departments.length - 2} more`;
    }
    return c.departmentName || "General Department";
  };

  const getOptionLabel = (c) => {
    if (!c) return placeholder;
    const deptText = getDeptText(c);
    const isStudent = checkIsStudent(c);

    if (isStudent) {
      const batchOrRole = c.batch ? ` (Batch: ${c.batch})` : " (Student)";
      return `${c.name || "Student"}${batchOrRole} — ${deptText}${
        c.unreadCount > 0 ? ` (${c.unreadCount} unread)` : ""
      }`;
    }

    const formattedName = prefix ? `${prefix}${c.name}` : formatProfessorName(c.name);
    return `${formattedName} — ${deptText}${
      c.unreadCount > 0 ? ` (${c.unreadCount} unread)` : ""
    }`;
  };

  return (
    <div className="custom-select-container" ref={dropdownRef}>
      <button
        type="button"
        className="custom-select-trigger"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
      >
        <span className="custom-select-label">
          {selectedContact ? getOptionLabel(selectedContact) : placeholder}
        </span>
        <ChevronDown size={18} className={`custom-select-chevron ${isOpen ? "open" : ""}`} />
      </button>

      {isOpen && (
        <div className="custom-select-options-panel animate-fade-in">
          <div
            className={`custom-select-option ${!selectedId ? "selected" : ""}`}
            onClick={() => {
              onSelect("");
              setIsOpen(false);
            }}
          >
            {placeholder}
          </div>
          {options && options.length > 0 ? (
            options.map((c) => {
              const isSelected = selectedId === c._id;
              const isStudent = checkIsStudent(c);
              const deptText = getDeptText(c);

              return (
                <div
                  key={c._id}
                  className={`custom-select-option ${isSelected ? "selected" : ""}`}
                  onClick={() => {
                    onSelect(c._id);
                    setIsOpen(false);
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", width: "100%" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", minWidth: 0 }}>
                      <span style={{ fontWeight: 600 }}>
                        {isStudent ? (c.name || "Student") : (prefix ? `${prefix}${c.name}` : formatProfessorName(c.name))}
                      </span>
                      {isStudent && (
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 700,
                            padding: "1px 6px",
                            borderRadius: "4px",
                            backgroundColor: "#eff6ff",
                            color: "#1d4ed8",
                            border: "1px solid #bfdbfe",
                            display: "inline-flex",
                            alignItems: "center"
                          }}
                        >
                          {c.batch ? `Batch: ${c.batch}` : "Student"}
                        </span>
                      )}
                      <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>
                        — {deptText}
                      </span>
                    </div>
                    {c.unreadCount > 0 && (
                      <span className="unread-badge" style={{ fontSize: "11px", padding: "2px 7px", flexShrink: 0 }}>
                        {c.unreadCount} unread
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="custom-select-option" style={{ color: "var(--text-muted)", cursor: "default" }}>
              No contacts available
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MessageContactDropdown;
