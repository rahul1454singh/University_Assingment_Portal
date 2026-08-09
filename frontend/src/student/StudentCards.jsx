import React, { useState, useEffect } from "react";
import { FileEdit, Clock, CheckCircle2, XCircle } from "lucide-react";
import "../css/StudentCards.css";

const StudentCards = ({ counts }) => {
  const [animatedCounts, setAnimatedCounts] = useState({
    Draft: 0,
    Submitted: 0,
    Approved: 0,
    Rejected: 0
  });

  useEffect(() => {
    const targetDraft = counts?.Draft || 0;
    const targetSubmitted = counts?.Submitted || 0;
    const targetApproved = counts?.Approved || 0;
    const targetRejected = counts?.Rejected || 0;

    const maxValue = Math.max(targetDraft, targetSubmitted, targetApproved, targetRejected);

    let duration = maxValue < 10 ? 400 : 700;
    const interval = 20;
    const steps = Math.max(1, duration / interval);
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;

      setAnimatedCounts({
        Draft: Math.round((targetDraft * currentStep) / steps),
        Submitted: Math.round((targetSubmitted * currentStep) / steps),
        Approved: Math.round((targetApproved * currentStep) / steps),
        Rejected: Math.round((targetRejected * currentStep) / steps)
      });

      if (currentStep >= steps) {
        clearInterval(timer);
        setAnimatedCounts({
          Draft: targetDraft,
          Submitted: targetSubmitted,
          Approved: targetApproved,
          Rejected: targetRejected
        });
      }
    }, interval);

    return () => clearInterval(timer);
  }, [counts]);

  return (
    <div className="student-cards-grid">
      <div className="stat-card draft-card card-hover">
        <div className="card-top-row">
          <span className="card-title-text">Drafts</span>
          <div className="card-icon-wrapper draft-icon">
            <FileEdit size={20} />
          </div>
        </div>
        <div className="card-body-row">
          <h2 className="card-count-val">{animatedCounts.Draft}</h2>
          <p className="card-subtitle-text">Saved locally in drafts</p>
        </div>
      </div>

      <div className="stat-card submitted-card card-hover">
        <div className="card-top-row">
          <span className="card-title-text">Submitted</span>
          <div className="card-icon-wrapper submitted-icon">
            <Clock size={20} />
          </div>
        </div>
        <div className="card-body-row">
          <h2 className="card-count-val">{animatedCounts.Submitted}</h2>
          <p className="card-subtitle-text">Pending professor review</p>
        </div>
      </div>

      <div className="stat-card approved-card card-hover">
        <div className="card-top-row">
          <span className="card-title-text">Approved</span>
          <div className="card-icon-wrapper approved-icon">
            <CheckCircle2 size={20} />
          </div>
        </div>
        <div className="card-body-row">
          <h2 className="card-count-val">{animatedCounts.Approved}</h2>
          <p className="card-subtitle-text">Verified & completed</p>
        </div>
      </div>

      <div className="stat-card rejected-card card-hover">
        <div className="card-top-row">
          <span className="card-title-text">Rejected</span>
          <div className="card-icon-wrapper rejected-icon">
            <XCircle size={20} />
          </div>
        </div>
        <div className="card-body-row">
          <h2 className="card-count-val">{animatedCounts.Rejected}</h2>
          <p className="card-subtitle-text">Requires revisions</p>
        </div>
      </div>
    </div>
  );
};

export default StudentCards;