import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import { AnalysisProvider } from "./context/AnalysisContext";
import "bootstrap/dist/css/bootstrap.min.css";
import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AnalysisContext } from "./context/AnalysisContext";
import RecommendationDetails from "./components/RecommendationDetails";
import ProgressBar from "./components/ProgressBar";
import FocusTrap from "focus-trap-react";
import { AnimatePresence, motion } from "framer-motion";
import html2pdf from "html2pdf.js";
import {
  FaHome,
  FaInfoCircle,
  FaEnvelope,
  FaFlask,
  FaHistory,
  FaComment,
  FaBook,
} from "react-icons/fa";
import "./App.css";

// Home Component
function Home() {
  const { setAnalysisState } = useContext(AnalysisContext);
  useEffect(() => {
    setAnalysisState((prev) => ({
      ...prev,
      completion: { ...prev.completion, home: 100 },
    }));
  }, [setAnalysisState]);

  return (
    <div className="home-container text-center mt-5">
      <ProgressBar page="home" />
      <h1>Welcome to BloodCheck Advisor</h1>
      <p>Your personal blood report analyzer.</p>
      <Link to="/analyzer" className="btn btn-primary">
        Proceed to Analyzer
      </Link>
    </div>
  );
}

// About Component
function About() {
  const { setAnalysisState } = useContext(AnalysisContext);
  useEffect(() => {
    setAnalysisState((prev) => ({
      ...prev,
      completion: { ...prev.completion, about: 100 },
    }));
  }, [setAnalysisState]);

  return (
    <div className="about-container text-center mt-5">
      <ProgressBar page="about" />
      <h1>About BloodCheck Advisor</h1>
      <p>
        BloodCheck Advisor helps you analyze your blood reports efficiently using AI-powered technology.
      </p>
      <p>
        Our platform ensures accurate predictions and actionable recommendations for better health management.
      </p>
    </div>
  );
}

// Contact Component
function Contact() {
  const { setAnalysisState } = useContext(AnalysisContext);
  useEffect(() => {
    setAnalysisState((prev) => ({
      ...prev,
      completion: { ...prev.completion, contact: 100 },
    }));
  }, [setAnalysisState]);

  return (
    <div className="contact-container text-center mt-5">
      <ProgressBar page="contact" />
      <h1>Contact Us</h1>
      <p>Email: support@bloodcheck.com</p>
      <p>Phone: +91 123456789</p>
    </div>
  );
}

// History Component
function History() {
  const history = JSON.parse(localStorage.getItem("analysisHistory")) || [];

  return (
    <div className="history-container text-center mt-5">
      <ProgressBar page="history" />
      <h1>Analysis History</h1>
      {history.length === 0 ? (
        <p>No past analyses found.</p>
      ) : (
        <div className="history-grid">
          {history.map((report, index) => (
            <div key={index} className="history-card">
              <h3>Analysis #{index + 1}</h3>
              <p>Date: {report.date}</p>
              <p>Risk Level: {report.risk_level}</p>
              <p>Status: {report.status}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Feedback Component
function Feedback() {
  const [feedback, setFeedback] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Feedback submitted:", feedback);
    alert("Thank you for your feedback!");
    setFeedback("");
  };

  return (
    <div className="feedback-container text-center mt-5">
      <ProgressBar page="feedback" />
      <h1>Provide Feedback</h1>
      <form onSubmit={handleSubmit} className="mt-4">
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Share your thoughts..."
          rows="5"
          className="form-control"
          required
        />
        <button type="submit" className="btn btn-primary mt-3">
          Submit Feedback
        </button>
      </form>
    </div>
  );
}

// Health Tips Component
function HealthTips() {
  return (
    <div className="health-tips-container text-center mt-5">
      <ProgressBar page="health-tips" />
      <h1>Health Tips</h1>
      <div className="tips-grid">
        <div className="tip-card">
          <h3>Boost Your Hemoglobin</h3>
          <p>Eat iron-rich foods like spinach, red meat, and lentils to improve hemoglobin levels.</p>
        </div>
        <div className="tip-card">
          <h3>Stay Hydrated</h3>
          <p>Drink at least 8 glasses of water daily to support overall health and blood test results.</p>
        </div>
      </div>
    </div>
  );
}

// Navbar Component
function Navbar({ toggleTheme, theme }) {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container-fluid">
        <Link to="/" className="navbar-brand">
          <FaHome /> Home
        </Link>
        <div className="collapse navbar-collapse justify-content-end">
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link to="/about" className="nav-link">
                <FaInfoCircle /> About
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/contact" className="nav-link">
                <FaEnvelope /> Contact
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/analyzer" className="nav-link">
                <FaFlask /> Analyzer
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/history" className="nav-link">
                <FaHistory /> History
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/feedback" className="nav-link">
                <FaComment /> Feedback
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/health-tips" className="nav-link">
                <FaBook /> Health Tips
              </Link>
            </li>
            <li className="nav-item">
              <button
                onClick={toggleTheme}
                className="nav-link btn btn-link"
                aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
              >
                {theme === "light" ? "🌙 " : "☀️ "}
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

function Analyzer() {
  const navigate = useNavigate();
  const { analysisState, setAnalysisState } = useContext(AnalysisContext);

  const {
    file,
    responseMessage,
    preview,
    extractedText,
    prediction,
    showPreviewModal,
    showExtractedTextModal,
  } = analysisState;

  useEffect(() => {
    let completionRate = 0;
    if (file) completionRate += 25;
    if (extractedText) completionRate += 25;
    if (prediction) completionRate += 50;
    setAnalysisState((prev) => ({
      ...prev,
      completion: { ...prev.completion, analyzer: completionRate },
    }));
  }, [file, extractedText, prediction, setAnalysisState]);

  // Add Escape key support for modals
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        if (showPreviewModal) {
          setAnalysisState((prevState) => ({
            ...prevState,
            showPreviewModal: false,
          }));
        }
        if (showExtractedTextModal) {
          setAnalysisState((prevState) => ({
            ...prevState,
            showExtractedTextModal: false,
          }));
        }
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [showPreviewModal, showExtractedTextModal, setAnalysisState]);

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setAnalysisState((prevState) => ({
        ...prevState,
        responseMessage: "⚠️ Please select a file to upload.",
      }));
      return;
    }

    setAnalysisState((prevState) => ({
      ...prevState,
      loading: true,
    }));

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://127.0.0.1:5000/process-file", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }

      const data = await response.json();
      console.log("Backend Response:", data); // Log the response for debugging

      // Save to history
      const history = JSON.parse(localStorage.getItem("analysisHistory")) || [];
      history.push({
        date: new Date().toLocaleString(),
        risk_level: data.prediction.risk_level,
        status: data.prediction.status,
        out_of_range: data.prediction.out_of_range,
      });
      localStorage.setItem("analysisHistory", JSON.stringify(history));

      setAnalysisState({
        ...analysisState,
        responseMessage: "✅ File processed successfully!",
        extractedText: data.extracted_text,
        prediction: data.prediction,
        loading: false,
      });
    } catch (error) {
      setAnalysisState({
        ...analysisState,
        responseMessage: `❌ Error: ${error.message || "Error connecting to the server."}`,
        loading: false,
      });
    }
  };

  // Share Report as PDF
  const handleShareReport = () => {
    const element = document.createElement("div");
    element.innerHTML = `
      <h2>BloodCheck Advisor Report</h2>
      <h3>Analysis Summary</h3>
      <p>Risk Level: ${prediction.risk_level}</p>
      <p>Status: ${prediction.status}</p>
      <h3>Out-of-Range Parameters</h3>
      ${
        prediction.out_of_range
          .filter((item) => item.explanation && item.remedy)
          .map(
            (item) =>
              `<p><strong>${item.parameter} (${item.result} ${item.unit}) - ${item.flag}</strong><br>Explanation: ${item.explanation}<br>Remedy: ${item.remedy}</p>`
          )
          .join("")
      }
    `;
    const opt = {
      margin: 1,
      filename: "BloodCheck_Report.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    };
    html2pdf().set(opt).from(element).save();
  };

  // Close the preview modal when clicking outside
  const handlePreviewOverlayClick = (e) => {
    if (e.target.classList.contains("modal-overlay")) {
      setAnalysisState((prevState) => ({
        ...prevState,
        showPreviewModal: false,
      }));
    }
  };

  // Close the extracted text modal when clicking outside
  const handleExtractedTextOverlayClick = (e) => {
    if (e.target.classList.contains("modal-overlay")) {
      setAnalysisState((prevState) => ({
        ...prevState,
        showExtractedTextModal: false,
      }));
    }
  };

  return (
    <div className="analyzer-container d-flex justify-content-center align-items-start min-vh-100">
      <div className="text-center p-4 rounded shadow-lg" style={{ maxWidth: "700px" }}>
        <ProgressBar page="analyzer" />
        {/* Preview Section */}
        <div className="preview-section mb-4">
          <h1 className="mt-4">Upload Your Blood Report</h1>
          <form onSubmit={handleFileUpload} className="mt-4">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const selectedFile = e.target.files[0];
                setAnalysisState((prevState) => ({
                  ...prevState,
                  file: selectedFile,
                  preview: selectedFile && selectedFile.type.startsWith("image/")
                    ? URL.createObjectURL(selectedFile)
                    : null,
                }));
              }}
            />
            <button
              type="submit"
              disabled={analysisState.loading}
              className="btn btn-success ms-2"
            >
              {analysisState.loading ? "Analyzing..." : "Analyze"}
            </button>
          </form>
          {responseMessage && <p className="mt-3">{responseMessage}</p>}
          <div className="preview-buttons mt-3">
            {preview && (
              <button
                onClick={() =>
                  setAnalysisState((prevState) => ({
                    ...prevState,
                    showPreviewModal: true,
                  }))
                }
                className="btn btn-secondary me-2"
              >
                Preview Uploaded Report
              </button>
            )}
            {extractedText && (
              <button
                onClick={() =>
                  setAnalysisState((prevState) => ({
                    ...prevState,
                    showExtractedTextModal: true,
                  }))
                }
                className="btn btn-info"
              >
                View Extracted Text
              </button>
            )}
          </div>
        </div>

        {/* Prediction Results Split into Two Sections Below Buttons */}
        {prediction && (
          <div className="results-grid mt-4">
            {/* Section 1: Analysis Summary */}
            <div className="results-section">
              <h2>Analysis Summary</h2>
              <p>
                Risk Level:{" "}
                {prediction.risk_level === "Low Risk" ? (
                  <span className="text-success">✅ {prediction.risk_level}</span>
                ) : prediction.risk_level === "Moderate Risk" ? (
                  <span className="text-warning">⚠️ {prediction.risk_level}</span>
                ) : (
                  <span className="text-danger">🚨 {prediction.risk_level}</span>
                )}
              </p>
              <p>
                Status:{" "}
                {prediction.status === "Safe" ? (
                  <span className="text-success">✅ Safe</span>
                ) : (
                  <span className="text-danger">⚠️ Need Attention</span>
                )}
              </p>
              <button onClick={handleShareReport} className="btn btn-primary mt-2">
                Share Report
              </button>
            </div>

            {/* Section 2: Recommended Actions */}
            <div className="results-section">
              <h2>Recommended Actions</h2>
              {prediction.out_of_range && prediction.out_of_range.length > 0 ? (
                <>
                  {(() => {
                    const outOfRangeCount = prediction.out_of_range.filter(
                      (item) => item.explanation && item.remedy
                    ).length;
                    return outOfRangeCount > 0 ? (
                      <p>
                        {outOfRangeCount} parameter{outOfRangeCount !== 1 ? "s" : ""} {outOfRangeCount !== 1 ? "are" : "is"} out of range. Click below to view detailed recommendations.
                      </p>
                    ) : (
                      <p>No out-of-range values detected.</p>
                    );
                  })()}
                  <button
                    onClick={() =>
                      navigate("/recommendation-details", {
                        state: {
                          recommendations: prediction?.out_of_range,
                          from: "/analyzer",
                        },
                      })
                    }
                    className="btn btn-primary mt-2"
                  >
                    View Detailed Recommendations
                  </button>
                </>
              ) : (
                <p>No out-of-range values detected.</p>
              )}
            </div>
          </div>
        )}

        {/* Preview Modal */}
        {preview && showPreviewModal && (
          <FocusTrap>
            <div className="modal-overlay" onClick={handlePreviewOverlayClick}>
              <div className="modal-content bg-light p-4 rounded">
                <div className="modal-header">
                  <h2 className="mb-3">Report Preview</h2>
                  <button
                    onClick={() =>
                      setAnalysisState((prevState) => ({
                        ...prevState,
                        showPreviewModal: false,
                      }))
                    }
                    className="modal-close-btn"
                    aria-label="Close preview modal"
                  >
                    ×
                  </button>
                </div>
                <div className="modal-body">
                  <img src={preview} alt="Report Preview" className="preview-image mt-3" />
                </div>
              </div>
            </div>
          </FocusTrap>
        )}

        {/* Extracted Text Modal */}
        {extractedText && showExtractedTextModal && (
          <FocusTrap>
            <div className="modal-overlay" onClick={handleExtractedTextOverlayClick}>
              <div className="modal-content bg-light p-4 rounded">
                <div className="modal-header">
                  <h2 className="mb-3">Extracted Text</h2>
                  <button
                    onClick={() =>
                      setAnalysisState((prevState) => ({
                        ...prevState,
                        showExtractedTextModal: false,
                      }))
                    }
                    className="modal-close-btn"
                    aria-label="Close extracted text modal"
                  >
                    ×
                  </button>
                </div>
                <div className="modal-body">
                  <p>{extractedText}</p>
                </div>
              </div>
            </div>
          </FocusTrap>
        )}
      </div>
    </div>
  );
}

// Footer Component
function Footer() {
  return (
    <footer className="footer bg-dark text-white text-center py-3 fixed-bottom">
      <p>Contact: bloodcheck@caveworks.in | +91 123456789</p>
    </footer>
  );
}

// AppContent Component to use useLocation
function AppContent() {
  const location = useLocation();
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <>
      <Navbar toggleTheme={toggleTheme} theme={theme} />
      <div className="container mt-4 mb-5">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route
              path="/"
              element={
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  transition={{ duration: 0.3 }}
                >
                  <Home />
                </motion.div>
              }
            />
            <Route
              path="/about"
              element={
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  transition={{ duration: 0.3 }}
                >
                  <About />
                </motion.div>
              }
            />
            <Route
              path="/contact"
              element={
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  transition={{ duration: 0.3 }}
                >
                  <Contact />
                </motion.div>
              }
            />
            <Route
              path="/analyzer"
              element={
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  transition={{ duration: 0.3 }}
                >
                  <Analyzer />
                </motion.div>
              }
            />
            <Route
              path="/recommendation-details"
              element={
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  transition={{ duration: 0.3 }}
                >
                  <RecommendationDetails />
                </motion.div>
              }
            />
            <Route
              path="/history"
              element={
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  transition={{ duration: 0.3 }}
                >
                  <History />
                </motion.div>
              }
            />
            <Route
              path="/feedback"
              element={
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  transition={{ duration: 0.3 }}
                >
                  <Feedback />
                </motion.div>
              }
            />
            <Route
              path="/health-tips"
              element={
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  transition={{ duration: 0.3 }}
                >
                  <HealthTips />
                </motion.div>
              }
            />
          </Routes>
        </AnimatePresence>
      </div>
      <Footer />
    </>
  );
}

function App() {
  return (
    <AnalysisProvider>
      <Router>
        <AppContent />
      </Router>
    </AnalysisProvider>
  );
}

export default App;
