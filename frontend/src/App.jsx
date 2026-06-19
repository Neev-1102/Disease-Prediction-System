import { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import jsPDF from "jspdf";
import "jspdf-autotable";

import symptoms from "./symptoms";

const API_BASE_URL = "https://disease-prediction-backend-av56.onrender.com/api";

function App() {
  // ─── STATE MANAGEMENT ───────────────────────────────────────────
  const [user, setUser] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  
  const [validationError, setValidationError] = useState("");
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    age: "",
    gender: ""
  });

  useEffect(() => {
    const savedUser = localStorage.getItem("mediscan_user");
    const savedHistory = localStorage.getItem("history");
    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Error parsing history matrix", e);
      }
    }
  }, []);

  const options = symptoms.map((symptom) => ({
    value: symptom,
    label: symptom.replaceAll("_", " "),
  }));

  const handleSymptomChange = (selected) => {
    setSelectedSymptoms(selected || []);
    if (selected && selected.length >= 3) {
      setValidationError("");
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ─── AUTHENTICATION HANDLERS ────────────────────────────────────
  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");
    try {
      const res = await axios.post(`${API_BASE_URL}/register`, formData);
      if (res.data.success) {
        setAuthSuccess("Account created successfully! Please log in.");
        setIsRegistering(false);
        setFormData({ ...formData, password: "" });
      }
    } catch (err) {
      setAuthError(err.response?.data?.error || "Registration failed. Try again.");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError("");
    try {
      const res = await axios.post(`${API_BASE_URL}/login`, {
        email: formData.email,
        password: formData.password
      });
      if (res.data.success) {
        setUser(res.data.user);
        localStorage.setItem("mediscan_user", JSON.stringify(res.data.user));
      }
    } catch (err) {
      setAuthError(err.response?.data?.error || "Invalid email or password.");
    }
  };

  const handleLogout = () => {
    setUser(null);
    setResult(null);
    setSelectedSymptoms([]);
    localStorage.removeItem("mediscan_user");
  };

  // ─── PREDICTION ENGINE ──────────────────────────────────────────
  const predictDisease = async () => {
    try {
      const symptomArray = selectedSymptoms.map((item) => item.value);
      
      if (symptomArray.length < 3) {
        setValidationError("⚠️ Please select a minimum of 3 symptoms for an accurate prediction.");
        return;
      }

      setValidationError("");
      loading(true);

      const res = await axios.post(`${API_BASE_URL}/predict`, { 
        symptoms: symptomArray,
        user: user || {}
      });

      setResult(res.data);

      const newHistory = [...history, res.data];
      setHistory(newHistory);
      localStorage.setItem("history", JSON.stringify(newHistory));

    } catch (error) {
      console.error(error);
      alert(error.response?.data?.error || "Model evaluation failed.");
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    if (!result) return;
    
    const doc = new jsPDF();

    doc.setFillColor(74, 114, 159);
    doc.rect(14, 15, 182, 24, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("In-Patient Diagnostic Summary", 20, 26);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Patient's Electronic Copy", 20, 33);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("MEDISCAN AI CLINICS", 190, 26, { align: "right" });
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Automated Health Network", 190, 32, { align: "right" });

    doc.setTextColor(51, 51, 51);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Patient Demographics", 14, 49);

    const currentDate = new Date().toLocaleDateString();

    doc.autoTable({
      startY: 53,
      theme: "plain",
      styles: { fontSize: 9, cellPadding: 3, lineColor: [200, 200, 200], lineWidth: 0.2 },
      columnStyles: {
        0: { fontStyle: "bold", fillColor: [230, 238, 245], width: 30 },
        1: { width: 32 },
        2: { fontStyle: "bold", fillColor: [230, 238, 245], width: 28 },
        3: { width: 32 },
        4: { fontStyle: "bold", fillColor: [230, 238, 245], width: 28 },
        5: { width: 32 },
      },
      body: [
        ["Name", user?.name || "Verified Guest", "Gender", user?.gender || "N/A", "Location", "Outpatient Ward"],
        ["ID No.", "MS-" + Math.floor(100000 + Math.random() * 900000), "Date of Evaluation", currentDate, "Nationality", "Indian"],
        ["Visit No.", "2026-9-0" + Math.floor(1 + Math.random() * 9), "Age", (user?.age ? `${user.age} Years` : "N/A"), "Race", "Asian"]
      ],
    });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Medical & Diagnostic History", 14, doc.lastAutoTable.finalY + 12);

    const symptomText = selectedSymptoms.map((s) => s.label).join(", ");

    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 16,
      theme: "plain",
      styles: { fontSize: 9, cellPadding: 4, lineColor: [200, 200, 200], lineWidth: 0.2 },
      columnStyles: {
        0: { fontStyle: "bold", fillColor: [230, 238, 245], width: 45 },
        1: { textHeading: "paragraph" }
      },
      body: [
        ["Admission Indicators / Symptoms", symptomText],
        ["Principal Evaluating Specialist", result.specialist || "General Physician"],
        ["Reason for Evaluation", "Patient presented with a dense array of tracking acute markers."],
        ["Primary Predicted Diagnosis", `${result.disease.toUpperCase()} (${result.confidence}% Confidence Level)`],
        ["Secondary Alternative Target", result.top3?.[1] ? `${result.top3[1].disease} (${result.top3[1].confidence}%)` : "N.A."],
        ["Other Differential Targets", result.top3?.[2] ? `${result.top3[2].disease} (${result.top3[2].confidence}%)` : "N.A."],
        ["Clinical Precautions / Advice", (result.precautions || []).join(", ")]
      ],
    });

    const pageHeight = doc.internal.pageSize.height;
    doc.setDrawColor(200, 200, 200);
    doc.line(14, pageHeight - 20, 196, pageHeight - 20);
    
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.setFont("helvetica", "normal");
    doc.text("1-800-MEDISCAN // www.mediscan-ai-system.vercel.app", 105, pageHeight - 12, { align: "center" });
    doc.text("Page 1", 190, pageHeight - 12, { align: "right" });

    doc.save(`MediScan_Discharge_Summary_${user.name}.pdf`);
  };

  // ─── VIEW 1: AUTHENTICATION INTERFACE ───────────────────────────
  if (!user) {
    return (
      <div className="auth-screen">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-icon">📋</div>
            <h1 className="auth-title">MediScan AI</h1>
            <p className="auth-subtitle">Intelligent Health Analysis</p>
          </div>

          <h2 className="auth-heading-context">
            {isRegistering ? "Create your health profile" : "Welcome back"}
          </h2>

          {authError && <div className="alert-error">{authError}</div>}
          {authSuccess && <div className="alert-success">{authSuccess}</div>}

          <form onSubmit={isRegistering ? handleRegister : handleLogin} className="auth-form">
            {isRegistering && (
              <div>
                <label className="auth-field-label">Full Name</label>
                <input type="text" name="name" required value={formData.name} onChange={handleInputChange} className="auth-input-element" placeholder="Neev Rathod" />
              </div>
            )}
            <div>
              <label className="auth-field-label">Email Address</label>
              <input type="email" name="email" required value={formData.email} onChange={handleInputChange} className="auth-input-element" placeholder="you@health.com" />
            </div>
            <div>
              <label className="auth-field-label">Password</label>
              <input type="password" name="password" required value={formData.password} onChange={handleInputChange} className="auth-input-element" placeholder="••••••••" />
            </div>
            {isRegistering && (
              <div className="auth-split-row">
                <div>
                  <label className="auth-field-label">Age</label>
                  <input type="number" name="age" value={formData.age} onChange={handleInputChange} className="auth-input-element" placeholder="25" />
                </div>
                <div>
                  <label className="auth-field-label">Gender</label>
                  <select name="gender" value={formData.gender} onChange={handleInputChange} className="auth-input-element">
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            )}

            <button type="submit" className="auth-submit-btn">
              {isRegistering ? "Sign Up →" : "Sign In →"}
            </button>
          </form>

          <div className="auth-toggle-msg">
            {isRegistering ? "Already have an account? " : "Don't have an account? "}
            <button onClick={() => { setIsRegistering(!isRegistering); setAuthError(""); setAuthSuccess(""); }} className="auth-toggle-link">
              {isRegistering ? "Log In here" : "Create one"}
            </button>
          </div>
          <div className="auth-demo-banner">
            Demo: demo@health.com / demo123
          </div>
        </div>
      </div>
    );
  }

  // ─── VIEW 2: MEDICAL ANALYTICS INTERFACE ────────────────────────
  return (
    <div className="app-container">
      <div className="app-max-viewport">
        
        {/* TOP STATUS NAVIGATION BAR */}
        <div className="nav-header">
          <div className="nav-brand">
            <span className="nav-logo-box">🏥</span>
            <div>
              <h1 className="nav-title">MediScan AI</h1>
              <p className="nav-subtitle">Intelligent Health Analysis</p>
            </div>
          </div>
          <div className="nav-action-cluster">
            {result && (
              <button onClick={() => setResult(null)} className="btn-back">
                ← New Analysis
              </button>
            )}
            <div className="user-pill">
              <span className="user-pulse-indicator"></span>
              <span>{user.name}</span>
            </div>
            <button onClick={handleLogout} className="btn-logout">
              Logout
            </button>
          </div>
        </div>

        {!result ? (
          /* INITIAL CONTAINER INCLUDES LANDING HERO + CORE INPUT ENGINE */
          <div className="flex flex-col gap-6">
            
            {/* ─── NEW CLINICAL HERO ACCORDION BANNER ──────────────── */}
            <section className="medical-hero rounded-2xl">
              <div className="medical-hero-container">
                <div className="hero-text-content">
                  <h1 className="hero-main-title">MED CENTER</h1>
                  <h2 className="hero-tagline">Changing Lives, Right Here</h2>
                  <p className="hero-description">
                    Providing advanced, technology-driven healthcare with a personal touch. 
                    Discover our innovative approach to patient care and machine learning diagnostics.
                  </p>
                  <a href="#evaluation-matrix" className="btn-clinical-primary no-underline text-center">
                    Start System Scan ↓
                  </a>
                </div>
                
                {/* Visual Graphic Representation */}
                <div className="hidden md:flex justify-center items-center">
                  <img 
                    src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80" 
                    alt="Doctor" 
                    className="max-h-[380px] object-contain drop-shadow-2xl"
                  />
                </div>
              </div>
            </section>

            {/* INPUT COLLECTION CARD CONTAINER */}
            <div id="evaluation-matrix" className="matrix-cardScroll scroll-mt-6 matrix-card">
              <div>
                <h2 className="matrix-title">Run System Evaluation Matrix</h2>
                <p className="matrix-subtitle">Select any patient-reported indications below. A minimum of 3 symptoms is mathematically required to satisfy evaluation metrics.</p>
              </div>

              <div className="select-wrapper-dropdown">
                <Select
                  isMulti
                  options={options}
                  onChange={handleSymptomChange}
                  value={selectedSymptoms}
                  placeholder="Type or select symptom tags..."
                  className="basic-multi-select"
                  styles={{
                    control: (base) => ({ ...base, background: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '0.75rem', padding: '4px' }),
                    menu: (base) => ({ ...base, background: '#0f172a', borderRadius: '0.75rem', overflow: 'hidden' }),
                    option: (base, state) => ({ ...base, backgroundColor: state.isFocused ? '#1d4ed8' : '#0f172a', color: '#fff' }),
                    multiValue: (base) => ({ ...base, background: '#1e293b', border: '1px solid #475569', borderRadius: '0.375rem' }),
                    multiValueLabel: (base) => ({ ...base, color: '#f1f5f9' }),
                    multiValueRemove: (base) => ({ ...base, color: '#94a3b8', ':hover': { backgroundColor: '#ef4444', color: '#fff' } }),
                  }}
                />
              </div>

              {validationError && (
                <div className="validation-error-banner">
                  {validationError}
                </div>
              )}

              <button onClick={predictDisease} disabled={loading} className="btn-evaluate">
                {loading ? "Evaluating Diagnostics..." : "Evaluate Diagnostic Matrix"}
              </button>
            </div>

            {/* ─── NEW COMPREHENSIVE CLINICAL SERVICE TILES ─────────── */}
            <div className="services-section rounded-2xl border border-slate-800 bg-slate-900/50">
              <h3 className="services-header-title text-white">Comprehensive Healthcare Services</h3>
              <p className="services-header-subtitle">Advanced analytic workflows engineered to pinpoint underlying physical pathways quickly.</p>
              
              <div className="services-matrix-grid">
                <div className="service-clinical-card">
                  <div className="service-icon-frame">🩺</div>
                  <h4 className="service-card-title">Family Care</h4>
                  <p className="service-card-description">Tailored health checkups, chronic track profiles, and holistic wellness checks.</p>
                </div>
                <div className="service-clinical-card">
                  <div className="service-icon-frame">⚡</div>
                  <h4 className="service-card-title">Urgent Care</h4>
                  <p className="service-card-description">Immediate, direct medical parsing vectors for non-life-threatening indications.</p>
                </div>
                <div className="service-clinical-card">
                  <div className="service-icon-frame">🤖</div>
                  <h4 className="service-card-title">AI Diagnostics</h4>
                  <p className="service-card-description">Deep automated matrix pattern analytics for rapid anomaly isolation results.</p>
                </div>
              </div>
            </div>

          </div>
        ) : (
          /* RESPONSE VISUALIZATION REPORT GRID DISPLAY */
          <div className="results-stack">
            
            {/* THE IVORY VANILLA HIGHLIGHT BOX */}
            <div className="ivory-highlight-panel">
              <div className="urgency-badge">
                {result.urgency || "MODERATE"} PRIORITY
              </div>
              
              <span className="panel-tagline">Primary Diagnosis</span>
              <h2 className="primary-disease-heading">{result.disease}</h2>
              <p className="panel-category">Category: {result.category || "General Medicine"}</p>
              
              <div className="analysis-split-block">
                <div className="distribution-bars-container">
                  {result.top3 && result.top3.map((item, idx) => (
                    <div key={idx} className="metric-bar-row">
                      <span className="metric-label-slot">
                        {idx === 0 ? "Primary: " : idx === 1 ? "2nd: " : "3rd: "}{item.disease}
                      </span>
                      <div className="metric-track-bg">
                        <div className="metric-fill-indigo" style={{ width: `${item.confidence}%` }} />
                      </div>
                      <span className="metric-percentage-label">{item.confidence}%</span>
                    </div>
                  ))}
                </div>
                
                <div className="radial-percentage-box">
                  <span className="giant-percentage-text">{result.confidence}%</span>
                  <span className="sub-percentage-meta">confidence</span>
                </div>
              </div>

              {/* THREE DYNAMIC RANKING CARDS LOOP */}
              {result.top3 && (
                <div className="tri-card-grid">
                  {result.top3.map((item, idx) => (
                    <div key={idx} className="rank-card">
                      <div>
                        <span className="rank-card-meta">RANK #{idx + 1}</span>
                        <h4 className="rank-card-title">{item.disease}</h4>
                      </div>
                      <div className="rank-card-score-wrapper">
                        <span className="rank-card-percentage">{item.confidence}%</span>
                        <div className="rank-card-bar-bg">
                          <div className="rank-card-bar-fill" style={{ width: `${item.confidence}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* LOWER TWO-COLUMN SPLIT */}
            <div className="lower-metadata-grid">
              
              {/* SPECIALIST RECOM CARD */}
              <div className="column-info-card">
                <div>
                  <h3 className="column-card-title">Recommended Specialist</h3>
                  <p className="specialist-text-output">{result.specialist || "General Physician"}</p>
                  <p className="specialist-context-desc">The active vector parameters correlate directly with diagnostic profiles belonging to this medical track. Booking an evaluation window is suggested.</p>
                </div>
                <button onClick={downloadReport} className="btn-pdf-trigger">
                  📥 Download Report PDF Document
                </button>
              </div>

              {/* PRECAUTIONS CARD */}
              <div className="column-info-card">
                <h3 className="column-card-title">Precautions & Next Steps</h3>
                <ul className="precaution-list-wrapper">
                  {(result.precautions || []).map((item, index) => (
                    <li key={index} className="precaution-item-row">
                      <span className="precaution-bullet">•</span>
                      <span className="precaution-text-content">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </div>
        )}

        {/* LOG STORAGE HISTORY CONTAINER */}
        {history.length > 0 && (
          <div className="history-feed-container">
            <h3 className="history-heading">Personal Prediction Logs</h3>
            <div className="history-responsive-scroll">
              {history.map((item, index) => (
                <div key={index} className="history-log-pill">
                  <span className="history-disease-meta">{item.disease}</span>
                  <span className="history-score-badge">{item.confidence}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default App;