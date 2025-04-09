import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./RecommendationDetails.css";
import { Tooltip } from "react-tooltip";
import FocusTrap from "focus-trap-react";

function RecommendationDetails() {
  const location = useLocation();
  const navigate = useNavigate();

  // Extract recommendations from location.state
  const recommendations = location.state?.recommendations || [];
  console.log("Recommendations in RecommendationDetails:", recommendations); // Debug log

  // Filter to show only out-of-range parameters (with remedy)
  const outOfRangeItems = recommendations.filter((item) => item.remedy);

  // State to manage the modal visibility and selected parameter
  const [showModal, setShowModal] = useState(false);
  const [selectedParameter, setSelectedParameter] = useState(null);
  const [loadingModal, setLoadingModal] = useState(false);

  // Open the modal with the selected parameter's details
  const openModal = (item) => {
    setLoadingModal(true);
    setTimeout(() => {
      setSelectedParameter(item);
      setShowModal(true);
      setLoadingModal(false);
    }, 500); // Simulate a delay (remove in production if not needed)
  };

  // Close the modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedParameter(null);
  };

  // Close the modal when clicking outside the content
  const handleOverlayClick = (e) => {
    if (e.target.classList.contains("modal-overlay")) {
      closeModal();
    }
  };

  // Handle back navigation
  const handleBack = () => {
    navigate(location.state?.from || "/analyzer");
  };

  // Add Escape key support to close the modal
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape" && showModal) {
        closeModal();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [showModal]);

  // Render no recommendations message if none are available
  if (!outOfRangeItems || outOfRangeItems.length === 0) {
    return (
      <div className="recommendation-details-container">
        <h2 className="recommendation-title">Recommended Remedies</h2>
        <p className="no-recommendations">No out-of-range values detected.</p>
        <div className="text-center mt-4">
          <button
            className="btn btn-primary"
            onClick={handleBack}
            aria-label="Go back to previous page"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="recommendation-details-container">
      <h2 className="recommendation-title">Recommendation Details</h2>
      <div className="recommendations-grid" aria-label="Grid of out-of-range parameters and recommendations">
        {outOfRangeItems.map((item, index) => (
          <div key={index} className="recommendation-card">
            <div className="recommendation-card-header">
              <h5 className="card-title">{item.parameter}</h5>
              <span
                className={`flag ${item.flag.toLowerCase()}`}
                data-tooltip-id={`flag-tooltip-${index}`}
                data-tooltip-content={
                  item.flag.toLowerCase() === "low"
                    ? "Below normal range, may indicate a health issue."
                    : "Above normal range, may indicate a health issue."
                }
              >
                {item.flag}
              </span>
              <Tooltip id={`flag-tooltip-${index}`} place="top" effect="solid" />
            </div>
            <div className="recommendation-card-body">
              <p className="result-text">
                <strong>Result:</strong> {item.result} {item.unit}
              </p>
            </div>
            <button
              onClick={() => openModal(item)}
              className="btn btn-secondary btn-sm"
              aria-label={`View remedy for ${item.parameter}`}
            >
              View Remedy
            </button>
          </div>
        ))}
      </div>

      {/* Modal for displaying details */}
      {showModal && selectedParameter && !loadingModal ? (
        <FocusTrap>
          <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="modal-content">
              <div className="modal-header">
                <h3 className="modal-title">
                  {selectedParameter.parameter} ({selectedParameter.result} {selectedParameter.unit}) - {selectedParameter.flag}
                </h3>
                <button
                  onClick={closeModal}
                  className="modal-close-btn"
                  aria-label="Close remedy modal"
                >
                  ×
                </button>
              </div>
              <div className="modal-body">
                <p className="remedy-text">
                  <strong>Remedy:</strong> {selectedParameter.remedy || "No specific remedy available. Consult a healthcare provider."}
                </p>
              </div>
            </div>
          </div>
        </FocusTrap>
      ) : loadingModal ? (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="text-center mt-4">
        <button
          className="btn btn-primary"
          onClick={handleBack}
          aria-label="Go back to previous page"
        >
          Back
        </button>
      </div>
    </div>
  );
}

export default RecommendationDetails;
