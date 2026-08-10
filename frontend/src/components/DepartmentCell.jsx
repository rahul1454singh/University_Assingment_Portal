import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";

const DepartmentCell = ({ departments, userId, openPopoverId, setOpenPopoverId }) => {
  const isOpen = openPopoverId === userId;
  const buttonRef = useRef(null);
  const popoverRef = useRef(null);
  const [popoverStyle, setPopoverStyle] = useState({});

  if (!departments || departments.length === 0) return <span>-</span>;

  // Safely extract the name even if the backend failed to populate the array (returns string IDs)
  const getDeptName = (dep) => {
    if (!dep) return "-";
    if (typeof dep === "object" && dep.name) return dep.name;
    if (typeof dep === "string") return dep; // It might just be the name
    return "Unknown Dept (Unpopulated)";
  };

  if (departments.length === 1) {
    return (
      <span className="badge badge-neutral" style={{ fontSize: '11px', whiteSpace: 'nowrap' }}>
        {getDeptName(departments[0])}
      </span>
    );
  }

  // Calculate and update position smartly
  useEffect(() => {
    if (!isOpen) return;
    const updatePosition = () => {
      if (!buttonRef.current) return;
      const btnRect = buttonRef.current.getBoundingClientRect();
      const estimatedHeight = Math.min(departments.length * 28 + 40, 250);
      const spaceBelow = window.innerHeight - btnRect.bottom;
      const spaceAbove = btnRect.top;
      
      let top;
      let bottom = 'auto';
      
      if (spaceBelow < estimatedHeight && spaceAbove > spaceBelow) {
        bottom = (window.innerHeight - btnRect.top) + 6;
        top = 'auto';
      } else {
        top = btnRect.bottom + 6;
      }
      
      let left = btnRect.left;
      let right = 'auto';
      if (left + 260 > window.innerWidth - 20) {
        left = 'auto';
        right = 20;
      }
      
      setPopoverStyle({ top, bottom, left, right });
    };

    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen, departments.length]);

  // Handle clicking outside or pressing Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (
        popoverRef.current && 
        !popoverRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setOpenPopoverId(null);
      }
    };
    const handleEscape = (e) => {
      if (e.key === 'Escape') setOpenPopoverId(null);
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, setOpenPopoverId]);

  const handleToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenPopoverId(isOpen ? null : userId);
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'nowrap' }}>
        <span className="badge badge-neutral" style={{ fontSize: '11px', whiteSpace: 'nowrap', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', display: 'inline-block' }}>
          {getDeptName(departments[0])}
        </span>
        <button
          type="button"
          ref={buttonRef}
          onClick={handleToggle}
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

      {isOpen && createPortal(
        <div 
          ref={popoverRef}
          style={{
            position: 'fixed',
            ...popoverStyle,
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
            padding: '12px',
            zIndex: 99999,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            width: '260px',
            maxHeight: '250px',
            overflowY: 'auto'
          }}
        >
          <div style={{ fontSize: '12px', fontWeight: '600', color: '#475569', paddingBottom: '6px', borderBottom: '1px solid #f1f5f9', marginBottom: '2px' }}>
            Departments
          </div>
          {departments.slice(1).map((dep, idx) => (
            <span key={idx} className="badge badge-neutral" style={{ fontSize: '11px', whiteSpace: 'normal', textAlign: 'left', lineHeight: '1.4' }}>
              {getDeptName(dep)}
            </span>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
};

export default DepartmentCell;
