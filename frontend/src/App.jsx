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
      setLoading(true);

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
  
  // Explicitly fallback to a safe guest identifier if names are missing
  const patientName = user?.name || "Verified Guest";
  const doc = new jsPDF();

  // ─── 1. HEADER BANNER ──────────────────────────────────────────
  doc.setFillColor(74, 114, 159); 
  doc.rect(14, 15, 182, 24, "F");

  // Header Typography
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("In-Patient Diagnostic Summary", 20, 26);
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("Patient's Electronic Copy", 20, 33);

  // Hospital Branding Text (Right Aligned)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("MEDISCAN AI CLINICS", 190, 26, { align: "right" });
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Automated Health Network", 190, 32, { align: "right" });

  // ─── 2. PATIENT DEMOGRAPHICS MATRIX ───────────────────────────
  doc.setTextColor(51, 51, 51);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Patient Demographics", 14, 49);

  const currentDate = new Date().toLocaleDateString();

  // Generate Table 1 safely
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
      ["Name", patientName, "Gender", user?.gender || "N/A", "Location", "Outpatient Ward"],
      ["ID No.", "MS-" + Math.floor(100000 + Math.random() * 900000), "Date of Evaluation", currentDate, "Nationality", "Indian"],
      ["Visit No.", "2026-06-01", "Age", (user?.age ? `${user.age} Years` : "N/A"), "Race", "Asian"]
    ],
  });

  // Calculate safe programmatic height threshold position
  let currentY = doc.previousAutoTable ? doc.previousAutoTable.finalY : 80;

  // ─── 3. CLINICAL EVALUATION METRICS MATRIX ────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Medical & Diagnostic History", 14, currentY + 12);

  const symptomText = selectedSymptoms && selectedSymptoms.length > 0 
    ? selectedSymptoms.map((s) => s.label).join(", ") 
    : "No markers declared";

  // Generate Table 2 safely with fixed styling parameters
  doc.autoTable({
    startY: currentY + 16,
    theme: "plain",
    styles: { fontSize: 9, cellPadding: 4, lineColor: [200, 200, 200], lineWidth: 0.2 },
    columnStyles: {
      0: { fontStyle: "bold", fillColor: [230, 238, 245], width: 45 },
      1: { cellWidth: 'auto' } // Fixed the custom non-standard parameter bug here
    },
    body: [
      ["Admission Indicators / Symptoms", symptomText],
      ["Principal Evaluating Specialist", result.specialist || "General Physician"],
      ["Reason for Evaluation", "Patient presented with a dense array of tracking acute markers."],
      ["Primary Predicted Diagnosis", `${(result.disease || "N/A").toUpperCase()} (${result.confidence || 0}% Confidence Level)`],
      ["Secondary Alternative Target", result.top3?.[1] ? `${result.top3[1].disease} (${result.top3[1].confidence}%)` : "N.A."],
      ["Other Differential Targets", result.top3?.[2] ? `${result.top3[2].disease} (${result.top3[2].confidence}%)` : "N.A."],
      ["Clinical Precautions / Advice", result.precautions && result.precautions.length > 0 ? result.precautions.join(", ") : "None specified"]
    ],
  });

  // ─── 4. CLINICAL FOOTER META STRIP ────────────────────────────
  const pageHeight = doc.internal.pageSize.height;
  doc.setDrawColor(200, 200, 200);
  doc.line(14, pageHeight - 20, 196, pageHeight - 20);
  
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.setFont("helvetica", "normal");
  doc.text("1-800-MEDISCAN // www.mediscan-ai-system.vercel.app", 105, pageHeight - 12, { align: "center" });
  doc.text("Page 1", 190, pageHeight - 12, { align: "right" });

  // Stream deployment download sequence to system directory
  doc.save(`MediScan_Discharge_Summary_${patientName.replace(/\s+/g, "_")}.pdf`);
};

  // ─── VIEW 1: AUTHENTICATION INTERFACE (DARK COMPACT WINDOW) ──────
  if (!user) {
    return (
      <div className="min-h-screen bg-[#111827] flex justify-center items-center p-5">
        <div className="bg-[#1f2937] text-white shadow-2xl rounded-2xl p-8 w-full max-w-md border border-slate-700/50">
          <div className="flex flex-col items-center mb-6">
            <div className="bg-blue-600/20 text-blue-400 p-3 rounded-xl mb-3 text-2xl">📋</div>
            <h1 className="text-3xl font-bold tracking-tight text-center">MediScan AI</h1>
            <p className="text-slate-400 text-sm mt-1 text-center">Intelligent Health Analysis</p>
          </div>

          <h2 className="text-xl font-semibold mb-4 text-center">
            {isRegistering ? "Create your health profile" : "Welcome back"}
          </h2>

          {authError && <div className="mb-4 p-3 bg-red-900/30 border border-red-500/40 text-red-400 rounded-lg text-sm text-center font-medium">{authError}</div>}
          {authSuccess && <div className="mb-4 p-3 bg-green-900/30 border border-green-500/40 text-green-400 rounded-lg text-sm text-center font-medium">{authSuccess}</div>}

          <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-4">
            {isRegistering && (
              <div>
                <label className="text-xs font-bold text-slate-400 tracking-wider uppercase block mb-1">Full Name</label>
                <input type="text" name="name" required value={formData.name} onChange={handleInputChange} className="w-full bg-[#111827] border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500" placeholder="e.g Neev Rathod" />
              </div>
            )}
            <div>
              <label className="text-xs font-bold text-slate-400 tracking-wider uppercase block mb-1">Email Address</label>
              <input type="email" name="email" required value={formData.email} onChange={handleInputChange} className="w-full bg-[#111827] border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500" placeholder="you@.com" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 tracking-wider uppercase block mb-1">Password</label>
              <input type="password" name="password" required value={formData.password} onChange={handleInputChange} className="w-full bg-[#111827] border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500" placeholder="••••••••" />
            </div>
            {isRegistering && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-400 tracking-wider uppercase block mb-1">Age</label>
                  <input type="number" name="age" value={formData.age} onChange={handleInputChange} className="w-full bg-[#111827] border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500" placeholder="25" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 tracking-wider uppercase block mb-1">Gender</label>
                  <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full bg-[#111827] border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500">
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            )}

            <button type="submit" className="w-full mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 rounded-lg transition duration-200 shadow-lg">
              {isRegistering ? "Sign Up →" : "Sign In →"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-400">
            {isRegistering ? "Already have an account? " : "Don't have an account? "}
            <button onClick={() => { setIsRegistering(!isRegistering); setAuthError(""); setAuthSuccess(""); }} className="text-blue-400 font-semibold hover:underline">
              {isRegistering ? "Log In here" : "Create one"}
            </button>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-700/50 text-center text-xs text-slate-500 font-mono">
            Demo: demo@health.com / demo123
          </div>
        </div>
      </div>
    );
  }

  // ─── VIEW 2: MEDICAL ANALYTICS INTERFACE (PREMIUM SLATE BLUE THEME) ───
  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 p-4 sm:p-6 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* TOP STATUS NAVIGATION BAR */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-[#1e293b] rounded-2xl p-4 border border-slate-700/40 gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <span className="text-2xl bg-slate-900/50 p-2 rounded-xl">🏥</span>
            <div>
              <h1 className="text-xl font-bold tracking-tight">MediScan AI</h1>
              <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Intelligent Health Analysis</p>
            </div>
          </div>
          <div className="flex items-center gap-3 self-end sm:self-auto">
            {result && (
              <button onClick={() => setResult(null)} className="text-xs bg-[#0f172a] border border-slate-700 px-4 py-2 hover:bg-slate-800 transition rounded-xl text-slate-300">
                ← New Analysis
              </button>
            )}
            <div className="bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-2 text-xs flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-slate-300 font-medium">{user.name}</span>
            </div>
            <button onClick={handleLogout} className="text-xs bg-red-950/40 hover:bg-red-900/30 border border-red-500/20 text-red-400 px-4 py-2 rounded-xl transition">
              Logout
            </button>
          </div>
        </div>

        {!result ? (
          /* INPUT COLLECTION CARD CONTAINER */
          <div className="bg-[#1e293b] rounded-2xl border border-slate-700/40 p-6 shadow-xl space-y-5">
            <div>
              <h2 className="text-lg font-bold text-slate-200">Run System Evaluation Matrix</h2>
              <p className="text-xs text-slate-400 mt-0.5">Select any patient-reported indications below. A minimum of 3 symptoms is mathematically required to satisfy evaluation metrics.</p>
            </div>

            <div className="text-slate-900">
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
              <div className="p-3 bg-red-950/40 border border-red-500/30 text-red-400 rounded-xl text-xs font-medium text-center">
                {validationError}
              </div>
            )}

            <button onClick={predictDisease} disabled={loading} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 rounded-xl transition duration-200 shadow-lg disabled:opacity-40">
              {loading ? "Evaluating Diagnostics..." : "Evaluate Diagnostic Matrix"}
            </button>
          </div>
        ) : (
          /* RESPONSE VISUALIZATION REPORT GRID DISPLAY */
          <div className="space-y-5">
            
            {/* MATCHED LOCAL SCREENSHOT STYLING: THE IVORY VANILLA HIGHLIGHT BOX */}
            <div className="bg-[#fefce8] text-slate-950 rounded-3xl p-6 sm:p-8 relative border border-amber-200 shadow-xl">
              <div className="absolute top-6 right-6 bg-[#ea580c] text-white text-[10px] font-bold tracking-widest px-3 py-1.5 rounded-xl uppercase">
                {result.urgency || "MODERATE"} PRIORITY
              </div>
              
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Primary Diagnosis</span>
              <h2 className="text-4xl font-black text-slate-900 mt-1 mb-1 tracking-tight capitalize">{result.disease}</h2>
              <p className="text-xs text-slate-500 mb-6">Category: {result.category || "General Medicine"}</p>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-amber-200/80 pb-6 mb-6">
                <div className="flex-1 space-y-3.5">
                  {result.top3 && result.top3.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 text-xs font-semibold text-slate-600">
                      <span className="w-36 text-slate-500 capitalize truncate">
                        {idx === 0 ? "Primary: " : idx === 1 ? "2nd: " : "3rd: "}{item.disease}
                      </span>
                      <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div className="bg-indigo-600 h-2 rounded-full transition-all duration-500" style={{ width: `${item.confidence}%` }} />
                      </div>
                      <span className="w-10 text-right font-bold text-slate-900">{item.confidence}%</span>
                    </div>
                  ))}
                </div>
                
                <div className="flex flex-col items-center sm:items-end justify-center min-w-[140px]">
                  <span className="text-5xl font-black text-[#ea580c] tracking-tighter">{result.confidence}%</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">confidence</span>
                </div>
              </div>

              {/* THREE DYNAMIC RANKING CARDS LOOP */}
              {result.top3 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                  {result.top3.map((item, idx) => (
                    <div key={idx} className="bg-[#1e293b] text-white p-4 rounded-xl border border-slate-700/30 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">RANK #{idx + 1}</span>
                        <h4 className="text-sm font-bold capitalize text-slate-300 mt-0.5 truncate">{item.disease}</h4>
                      </div>
                      <div className="mt-4">
                        <span className="text-2xl font-black text-blue-400 tracking-tight">{item.confidence}%</span>
                        <div className="w-full bg-slate-800 rounded-full h-1 mt-1.5 overflow-hidden">
                          <div className="bg-blue-500 h-1 rounded-full" style={{ width: `${item.confidence}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* LOWER TWO-COLUMN SYSTEM SPLIT METADATA BLOCK COMPONENT CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* SPECIALIST RECOM CARD */}
              <div className="bg-[#1e293b] border border-slate-700/40 p-5 rounded-2xl flex flex-col justify-between shadow-xl">
                <div>
                  <h3 className="text-xs font-bold tracking-wider text-slate-400 uppercase mb-3">Recommended Specialist</h3>
                  <p className="text-xl font-bold text-slate-100 capitalize tracking-tight">{result.specialist || "General Physician"}</p>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">The active vector parameters correlate directly with diagnostic profiles belonging to this medical track. Booking an evaluation window is suggested.</p>
                </div>
                <button onClick={downloadReport} className="w-full mt-6 bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 py-2.5 text-xs font-medium rounded-xl transition">
                  📥 Download Report PDF Document
                </button>
              </div>

              {/* PRECAUTIONS LOGICAL ROW WRAPPER CARD */}
              <div className="bg-[#1e293b] border border-slate-700/40 p-5 rounded-2xl shadow-xl">
                <h3 className="text-xs font-bold tracking-wider text-slate-400 uppercase mb-3">Precautions & Next Steps</h3>
                <ul className="space-y-3 text-xs">
                  {(result.precautions || []).map((item, index) => (
                    <li key={index} className="flex items-start gap-2.5 text-slate-300 border-b border-slate-800/60 pb-2.5 last:border-0 last:pb-0">
                      <span className="text-blue-400 font-bold">•</span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </div>
        )}

        {/* LOG STORAGE HISTORY SYSTEM LIST CONTAINER FEED */}
        {history.length > 0 && (
          <div className="bg-[#1e293b] rounded-2xl border border-slate-700/40 p-5 shadow-xl">
            <h3 className="text-sm font-bold text-slate-300 mb-3 tracking-tight">Personal Prediction Logs</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-40 overflow-y-auto pr-1">
              {history.map((item, index) => (
                <div key={index} className="bg-[#0f172a] border border-slate-800 p-3 rounded-xl flex justify-between items-center text-xs">
                  <span className="capitalize font-semibold text-slate-300 truncate max-w-[130px]">{item.disease}</span>
                  <span className="font-mono bg-blue-950/60 text-blue-400 font-bold px-2 py-0.5 rounded border border-blue-900/40">{item.confidence}%</span>
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