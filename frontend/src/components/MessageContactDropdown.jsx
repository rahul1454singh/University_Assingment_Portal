import React, { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";

const MessageContactDropdown = ({ placeholder, options, selectedId, onSelect, prefix = "" }) => {
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

  const getOptionLabel = (c) => {
    let deptText = c.departmentName || "General Department";
    if (c.departments && c.departments.length > 0) {
      if (c.departments.length <= 2) {
        deptText = c.departments.join(", ");
      } else {
        deptText = `${c.departments.slice(0, 2).join(", ")} +${c.departments.length - 2} more`;
      }
    }
    return `${prefix}${c.name} — ${deptText}${
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
              return (
                <div
                  key={c._id}
                  className={`custom-select-option ${isSelected ? "selected" : ""}`}
                  onClick={() => {
                    onSelect(c._id);
                    setIsOpen(false);
                  }}
                >
                  {getOptionLabel(c)}
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
