import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./RecommendationDetails.css";

// Knowledge Base
const knowledgeBase = {
  "Check WBC levels":
    "White blood cells (WBCs) are crucial for fighting infections. Abnormal levels may indicate an infection or immune system issue.",
  "Check RBC levels":
    "Red blood cells (RBCs) carry oxygen throughout the body. Low levels may indicate anemia or other conditions.",
  "Check Hemoglobin levels":
    "Hemoglobin is essential for transporting oxygen in the blood. Low hemoglobin levels may indicate anemia.",
  "Check Platelet levels":
    "Platelets help with blood clotting. Abnormal levels may increase the risk of bleeding or clotting disorders.",
  "Check Glucose levels":
    "Glucose levels are critical for energy production. High or low levels may indicate diabetes or hypoglycemia.",
  "Check Cholesterol levels":
    "Cholesterol is important for cell membrane structure. High levels may increase the risk of heart disease.",
  "Check Neutrophil levels":
    "Neutrophils are a type of white blood cell that fights bacterial infections. Abnormal levels may indicate infection or inflammation.",
  "Check Lymphocyte levels":
    "Lymphocytes are part of the immune system. Abnormal levels may indicate viral infections or immune disorders.",
  "Check Eosinophil levels":
    "Eosinophils are involved in allergic reactions and fighting parasitic infections. Abnormal levels may indicate allergies or parasitic infections.",
  "Check MCV levels":
    "MCV measures the average size of red blood cells. Abnormal levels may indicate anemia or other conditions.",
  "Check MCH levels":
    "MCH measures the average amount of hemoglobin in red blood cells. Abnormal levels may indicate anemia or other conditions.",
  "Check MCHC levels":
    "MCHC measures the concentration of hemoglobin in red blood cells. Abnormal levels may indicate anemia or other conditions.",
  "Check Hematocrit levels":
    "Hematocrit measures the proportion of red blood cells in your blood. Abnormal levels may indicate anemia or dehydration.",
};

function RecommendationDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const { prediction, from } = location.state || {};
  const [expandedRecommendation, setExpandedRecommendation] = useState(null);

  // Memoize the recommendationsArray to prevent unnecessary recalculations
  const recommendationsArray = useMemo(() => {
    return Array.isArray(prediction?.recommendations)
      ? prediction.recommendations
      : prediction?.recommendations?.split(/,\s*|;\s*/) || [];
  }, [prediction]);

  // Log recommendations for debugging
  useEffect(() => {
    console.log("Recommendations:", recommendationsArray);
    recommendationsArray.forEach((rec) => {
      if (!knowledgeBase[rec]) {
        console.warn(`No knowledge base entry found for: ${rec}`);
      }
    });
  }, [recommendationsArray]);

  // Handle back navigation
  const handleBack = () => {
    navigate(from || "/");
  };

  // Render no recommendations message if none are available
  if (!recommendationsArray || recommendationsArray.length === 0) {
    return (
      <div className="no-recommendations">
        <p>No recommendations available.</p>
        <button onClick={handleBack}>Back</button>
      </div>
    );
  }

  return (
    <div className="recommendation-details-container">
      <h2>Knowledge Base</h2>
      <button className="back-button" onClick={handleBack}>
        Back
      </button>
      <ul className="recommendations-list">
        {recommendationsArray.map((rec, index) => (
          <li key={index} className="recommendation-item">
            <button
              className="recommendation-button"
              onClick={() =>
                setExpandedRecommendation(expandedRecommendation === rec ? null : rec)
              }
            >
              {rec}
            </button>
            {expandedRecommendation === rec && (
              <div className="tooltip">
                {knowledgeBase[rec] || "No detailed information available."}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default RecommendationDetails;
