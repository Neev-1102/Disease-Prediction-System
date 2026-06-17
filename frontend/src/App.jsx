import { useState, useEffect, useRef } from "react";

// ── PDF generation (client-side via canvas / print) ──────────
const generatePDF = (data) => {
  const { user, result, symptoms, timestamp } = data;
  const win = window.open("", "_blank");
  const urgencyColor = { high: "#DC2626", moderate: "#D97706", low: "#059669" };
  const uc = urgencyColor[result.urgency] || "#6B7280";

  win.document.write(`<!DOCTYPE html><html><head>
  <meta charset="UTF-8"/>
  <title>Medical Report — ${result.disease}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Segoe UI',sans-serif;background:#f0f4f8;color:#1a202c}
    .page{width:794px;min-height:1123px;background:#fff;margin:0 auto;padding:0;box-shadow:0 0 40px rgba(0,0,0,.15)}
    /* Header */
    .header{background:linear-gradient(135deg,#0f172a 0%,#1e3a5f 60%,#0ea5e9 100%);padding:40px 48px 32px;position:relative;overflow:hidden}
    .header::before{content:'';position:absolute;top:-60px;right:-60px;width:240px;height:240px;background:rgba(14,165,233,.15);border-radius:50%}
    .header::after{content:'';position:absolute;bottom:-40px;left:20%;width:160px;height:160px;background:rgba(255,255,255,.04);border-radius:50%}
    .header-top{display:flex;justify-content:space-between;align-items:flex-start;position:relative;z-index:1}
    .logo-area{display:flex;align-items:center;gap:14px}
    .logo-icon{width:48px;height:48px;background:rgba(14,165,233,.25);border:2px solid rgba(14,165,233,.5);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:24px}
    .logo-text h1{color:#fff;font-size:22px;font-weight:700;letter-spacing:-.3px}
    .logo-text p{color:#94a3b8;font-size:12px;margin-top:2px}
    .report-badge{background:rgba(14,165,233,.2);border:1px solid rgba(14,165,233,.4);border-radius:8px;padding:8px 16px;text-align:right}
    .report-badge .label{color:#94a3b8;font-size:10px;text-transform:uppercase;letter-spacing:1px}
    .report-badge .value{color:#e0f2fe;font-size:13px;font-weight:600;margin-top:2px}
    .header-title{margin-top:28px;position:relative;z-index:1}
    .header-title h2{color:#fff;font-size:32px;font-weight:800;letter-spacing:-1px}
    .header-title p{color:#94a3b8;font-size:14px;margin-top:6px}
    .header-divider{height:3px;background:linear-gradient(90deg,#0ea5e9,#6366f1,transparent);margin-top:24px;border-radius:2px;position:relative;z-index:1}
    /* Patient info */
    .patient-section{padding:28px 48px;background:#f8fafc;border-bottom:1px solid #e2e8f0}
    .section-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#64748b;margin-bottom:14px}
    .patient-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
    .patient-card{background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:14px 16px}
    .patient-card .field{font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:.8px}
    .patient-card .val{font-size:15px;font-weight:600;color:#0f172a;margin-top:4px}
    /* Main content */
    .content{padding:32px 48px}
    /* Diagnosis card */
    .diagnosis-card{border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;margin-bottom:28px;box-shadow:0 4px 20px rgba(0,0,0,.06)}
    .diagnosis-header{background:linear-gradient(135deg,#0f172a,#1e3a5f);padding:20px 28px;display:flex;justify-content:space-between;align-items:center}
    .diagnosis-header h3{color:#e0f2fe;font-size:13px;text-transform:uppercase;letter-spacing:1px}
    .urgency-pill{padding:5px 14px;border-radius:20px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;background:${uc}22;color:${uc};border:1px solid ${uc}55}
    .diagnosis-body{padding:24px 28px;background:#fff}
    .disease-name{font-size:28px;font-weight:800;color:#0f172a;letter-spacing:-1px}
    .disease-category{font-size:13px;color:#64748b;margin-top:4px}
    .confidence-row{display:flex;align-items:center;gap:16px;margin-top:20px}
    .conf-label{font-size:12px;color:#64748b;min-width:90px}
    .conf-bar-wrap{flex:1;height:10px;background:#f1f5f9;border-radius:5px;overflow:hidden}
    .conf-bar{height:100%;background:linear-gradient(90deg,#0ea5e9,#6366f1);border-radius:5px}
    .conf-value{font-size:14px;font-weight:700;color:#0f172a;min-width:48px;text-align:right}
    /* Alt diagnoses */
    .alt-section{margin-bottom:28px}
    .alt-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:12px}
    .alt-card{border:1px solid #e2e8f0;border-radius:12px;padding:16px;background:#fff}
    .alt-card .rank{font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:.8px}
    .alt-card .name{font-size:14px;font-weight:600;color:#0f172a;margin-top:4px}
    .alt-card .prob{font-size:20px;font-weight:800;color:#0ea5e9;margin-top:6px}
    .alt-card .bar{height:4px;background:#f1f5f9;border-radius:2px;margin-top:10px;overflow:hidden}
    .alt-card .bar-fill{height:100%;background:#0ea5e9;border-radius:2px}
    /* Two columns */
    .two-col{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:28px}
    .info-card{border:1px solid #e2e8f0;border-radius:12px;overflow:hidden}
    .info-card-header{background:#f8fafc;padding:14px 18px;border-bottom:1px solid #e2e8f0}
    .info-card-header h4{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#475569}
    .info-card-body{padding:16px 18px}
    .specialist-name{font-size:18px;font-weight:700;color:#0f172a}
    .specialist-sub{font-size:12px;color:#64748b;margin-top:4px}
    .prec-list{list-style:none}
    .prec-list li{display:flex;gap:10px;align-items:flex-start;padding:8px 0;border-bottom:1px solid #f1f5f9;font-size:13px;color:#374151}
    .prec-list li:last-child{border-bottom:none}
    .prec-dot{width:6px;height:6px;background:#0ea5e9;border-radius:50%;margin-top:6px;flex-shrink:0}
    /* Symptoms */
    .sym-section{margin-bottom:28px}
    .sym-grid{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}
    .sym-pill{background:#eff6ff;border:1px solid #bfdbfe;color:#1d4ed8;border-radius:20px;padding:6px 14px;font-size:12px;font-weight:500}
    /* Footer */
    .footer{margin-top:auto;background:#0f172a;padding:20px 48px;display:flex;justify-content:space-between;align-items:center}
    .footer-left{color:#475569;font-size:11px;line-height:1.6}
    .footer-left strong{color:#94a3b8}
    .footer-right{text-align:right}
    .footer-right .disclaimer{color:#374151;font-size:10px;max-width:280px;line-height:1.5;color:#64748b}
    .page-num{color:#334155;font-size:11px;margin-top:6px;color:#475569}
    @media print{body{background:#fff}.page{box-shadow:none}}
  </style>
  </head><body>
  <div class="page">
    <div class="header">
      <div class="header-top">
        <div class="logo-area">
          <div class="logo-icon">🏥</div>
          <div class="logo-text">
            <h1>MediScan AI</h1>
            <p>Intelligent Symptom Analysis Platform</p>
          </div>
        </div>
        <div class="report-badge">
          <div class="label">Report ID</div>
          <div class="value">RPT-${Math.random().toString(36).substr(2,8).toUpperCase()}</div>
          <div class="label" style="margin-top:8px">Generated</div>
          <div class="value">${new Date(timestamp).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})}</div>
        </div>
      </div>
      <div class="header-title">
        <h2>Medical Diagnosis Report</h2>
        <p>AI-assisted symptom analysis — for consultation purposes only</p>
      </div>
      <div class="header-divider"></div>
    </div>

    <div class="patient-section">
      <div class="section-label">Patient Information</div>
      <div class="patient-grid">
        <div class="patient-card"><div class="field">Full Name</div><div class="val">${user?.name || "Anonymous"}</div></div>
        <div class="patient-card"><div class="field">Age</div><div class="val">${user?.age || "—"}</div></div>
        <div class="patient-card"><div class="field">Gender</div><div class="val">${user?.gender || "—"}</div></div>
        <div class="patient-card"><div class="field">Analysis Date</div><div class="val">${new Date(timestamp).toLocaleDateString("en-IN",{day:"2-digit",month:"long",year:"numeric"})}</div></div>
      </div>
    </div>

    <div class="content">
      <div class="diagnosis-card">
        <div class="diagnosis-header">
          <h3>Primary Diagnosis</h3>
          <div class="urgency-pill">${(result.urgency||"low").toUpperCase()} PRIORITY</div>
        </div>
        <div class="diagnosis-body">
          <div class="disease-name">${result.disease}</div>
          <div class="disease-category">Category: ${result.category || "General"}</div>
          ${[result.top3?.[0], result.top3?.[1], result.top3?.[2]].filter(Boolean).map((t,i) => `
          <div class="confidence-row">
            <div class="conf-label">${i===0?"Confidence":"Alternative "+(i)}</div>
            <div class="conf-bar-wrap"><div class="conf-bar" style="width:${t.confidence}%"></div></div>
            <div class="conf-value">${t.confidence}%</div>
          </div>`).join("")}
        </div>
      </div>

      ${result.top3?.length > 1 ? `
      <div class="alt-section">
        <div class="section-label">Differential Diagnoses</div>
        <div class="alt-grid">
          ${result.top3.map((t,i)=>`
          <div class="alt-card">
            <div class="rank">Rank #${i+1}</div>
            <div class="name">${t.disease}</div>
            <div class="prob">${t.confidence}%</div>
            <div class="bar"><div class="bar-fill" style="width:${t.confidence}%"></div></div>
          </div>`).join("")}
        </div>
      </div>` : ""}

      <div class="two-col">
        <div class="info-card">
          <div class="info-card-header"><h4>Recommended Specialist</h4></div>
          <div class="info-card-body">
            <div class="specialist-name">${result.specialist || "General Physician"}</div>
            <div class="specialist-sub">Schedule an appointment at the earliest</div>
          </div>
        </div>
        <div class="info-card">
          <div class="info-card-header"><h4>Precautions &amp; Next Steps</h4></div>
          <div class="info-card-body">
            <ul class="prec-list">
              ${(result.precautions||["Consult a doctor"]).map(p=>`<li><span class="prec-dot"></span>${p}</li>`).join("")}
            </ul>
          </div>
        </div>
      </div>

      <div class="sym-section">
        <div class="section-label">Reported Symptoms (${symptoms.length})</div>
        <div class="sym-grid">
          ${symptoms.map(s=>`<span class="sym-pill">${s}</span>`).join("")}
        </div>
      </div>
    </div>

    <div class="footer">
      <div class="footer-left">
        <strong>MediScan AI</strong> · Intelligent Health Analysis<br>
        Report generated on ${new Date(timestamp).toLocaleString("en-IN")}
      </div>
      <div class="footer-right">
        <div class="disclaimer">⚠ This report is generated by AI and is for informational purposes only. It does not constitute medical advice. Always consult a qualified healthcare professional.</div>
        <div class="page-num">Page 1 of 1</div>
      </div>
    </div>
  </div>
  <script>window.onload=()=>{window.print();}</script>
  </body></html>`);
  win.document.close();
};

// ── Symptom list (common ones) ─────────────────────────────────
const SYMPTOMS = [
  "anxiety and nervousness","depression","shortness of breath","depressive or psychotic symptoms",
  "sharp chest pain","dizziness","insomnia","abnormal involuntary movements","chest tightness",
  "palpitations","irregular heartbeat","breathing fast","wheezing","skin lesion","skin rash",
  "acne or pimples","skin dryness or flaking","skin irritation","fatigue","fever",
  "headache","nausea","vomiting","abdominal pain","diarrhea","constipation","loss of appetite",
  "weight loss","weight gain","muscle weakness","joint pain","back pain","neck pain",
  "swelling of legs","frequent urination","blood in urine","painful urination","sore throat",
  "runny nose","cough","sneezing","ear pain","eye pain","blurred vision","double vision",
  "numbness","tingling","memory loss","confusion","seizures","tremors","hair loss",
  "excessive sweating","cold hands and feet","swollen lymph nodes","jaundice","blood in stool"
];

// ── Colour helpers ─────────────────────────────────────────────
const URGENCY_STYLE = {
  high:     { bg:"#FEF2F2", border:"#FCA5A5", text:"#DC2626", badge:"#DC2626" },
  moderate: { bg:"#FFFBEB", border:"#FCD34D", text:"#D97706", badge:"#D97706" },
  low:      { bg:"#F0FDF4", border:"#86EFAC", text:"#16A34A", badge:"#16A34A" },
};

// ══════════════════════════════════════════════════════════════
//  COMPONENTS
// ══════════════════════════════════════════════════════════════

// ── Animated background particles ─────────────────────────────
function Particles() {
  return (
    <div style={{position:"fixed",inset:0,pointerEvents:"none",overflow:"hidden",zIndex:0}}>
      {[...Array(18)].map((_,i)=>(
        <div key={i} style={{
          position:"absolute",
          width: `${6+i%5*4}px`, height: `${6+i%5*4}px`,
          borderRadius:"50%",
          background:`rgba(14,165,233,${0.04+i%3*0.03})`,
          left:`${(i*37)%100}%`, top:`${(i*53)%100}%`,
          animation:`float ${8+i%6}s ease-in-out ${i*0.7}s infinite alternate`,
        }}/>
      ))}
    </div>
  );
}

// ── Login page ────────────────────────────────────────────────
function LoginPage({ onLogin, onGoRegister }) {
  const [form, setForm] = useState({ email:"", password:"" });
  const [err, setErr]   = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault(); setErr(""); setLoading(true);
    try {
      const r = await fetch("http://localhost:5000/api/login",{
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify(form)
      });
      const d = await r.json();
      if (!r.ok) setErr(d.error);
      else onLogin(d.user);
    } catch { setErr("Cannot connect to server"); }
    setLoading(false);
  };

  return (
    <div style={styles.authWrap}>
      <Particles/>
      <div style={styles.authCard}>
        <div style={styles.authLogo}>
          <span style={styles.authLogoIcon}>🏥</span>
          <div>
            <div style={styles.authLogoTitle}>MediScan AI</div>
            <div style={styles.authLogoSub}>Intelligent Health Analysis</div>
          </div>
        </div>
        <h2 style={styles.authHeading}>Welcome back</h2>
        <p style={styles.authSubheading}>Sign in to access your health dashboard</p>

        <form onSubmit={submit} style={{marginTop:28}}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Email address</label>
            <input style={styles.input} type="email" placeholder="you@example.com"
              value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required/>
          </div>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Password</label>
            <input style={styles.input} type="password" placeholder="••••••••"
              value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required/>
          </div>
          {err && <div style={styles.errorBox}>{err}</div>}
          <button style={{...styles.btn, opacity:loading?.7:1}} type="submit" disabled={loading}>
            {loading ? "Signing in…" : "Sign in →"}
          </button>
        </form>

        <p style={styles.switchText}>
          Don't have an account?{" "}
          <span style={styles.link} onClick={onGoRegister}>Create one</span>
        </p>
        <p style={{...styles.switchText, marginTop:8, fontSize:11, color:"#94a3b8"}}>
          Demo: demo@health.com / demo123
        </p>
      </div>
    </div>
  );
}

// ── Register page ─────────────────────────────────────────────
function RegisterPage({ onLogin, onGoLogin }) {
  const [form, setForm] = useState({ name:"", email:"", password:"", age:"", gender:"" });
  const [err, setErr]   = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault(); setErr(""); setLoading(true);
    try {
      const r = await fetch("http://localhost:5000/api/register",{
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify(form)
      });
      const d = await r.json();
      if (!r.ok) setErr(d.error);
      else {
        // Auto-login after register
        const lr = await fetch("http://localhost:5000/api/login",{
          method:"POST", headers:{"Content-Type":"application/json"},
          body: JSON.stringify({email:form.email,password:form.password})
        });
        const ld = await lr.json();
        if (lr.ok) onLogin(ld.user);
      }
    } catch { setErr("Cannot connect to server"); }
    setLoading(false);
  };

  const f = (k,v) => setForm(p=>({...p,[k]:v}));

  return (
    <div style={styles.authWrap}>
      <Particles/>
      <div style={{...styles.authCard, maxWidth:520}}>
        <div style={styles.authLogo}>
          <span style={styles.authLogoIcon}>🏥</span>
          <div>
            <div style={styles.authLogoTitle}>MediScan AI</div>
            <div style={styles.authLogoSub}>Create your account</div>
          </div>
        </div>
        <h2 style={styles.authHeading}>Get started</h2>
        <p style={styles.authSubheading}>Your health information is private and secure</p>

        <form onSubmit={submit} style={{marginTop:28}}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Full name</label>
            <input style={styles.input} placeholder="Neev Shah"
              value={form.name} onChange={e=>f("name",e.target.value)} required/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Age</label>
              <input style={styles.input} type="number" placeholder="25" min="1" max="120"
                value={form.age} onChange={e=>f("age",e.target.value)}/>
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Gender</label>
              <select style={styles.input} value={form.gender} onChange={e=>f("gender",e.target.value)}>
                <option value="">Select</option>
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </div>
          </div>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Email address</label>
            <input style={styles.input} type="email" placeholder="you@example.com"
              value={form.email} onChange={e=>f("email",e.target.value)} required/>
          </div>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Password</label>
            <input style={styles.input} type="password" placeholder="Min 6 characters"
              value={form.password} onChange={e=>f("password",e.target.value)} required minLength={6}/>
          </div>
          {err && <div style={styles.errorBox}>{err}</div>}
          <button style={{...styles.btn, opacity:loading?.7:1}} type="submit" disabled={loading}>
            {loading ? "Creating account…" : "Create account →"}
          </button>
        </form>
        <p style={styles.switchText}>
          Already have an account?{" "}
          <span style={styles.link} onClick={onGoLogin}>Sign in</span>
        </p>
      </div>
    </div>
  );
}

// ── Main dashboard / predictor ────────────────────────────────
function Dashboard({ user, onLogout }) {
  const [search, setSearch]       = useState("");
  const [selected, setSelected]   = useState([]);
  const [result, setResult]       = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [page, setPage]           = useState("predict"); // predict | result
  const [animIn, setAnimIn]       = useState(false);

  useEffect(()=>{ setTimeout(()=>setAnimIn(true),50); },[]);

  const filtered = SYMPTOMS.filter(s =>
    s.toLowerCase().includes(search.toLowerCase()) && !selected.includes(s)
  );

  const toggle = (s) => {
    setSelected(p => p.includes(s) ? p.filter(x=>x!==s) : [...p,s]);
  };

  const predict = async () => {
    if (selected.length < 2) { setError("Please select at least 2 symptoms"); return; }
    setError(""); setLoading(true);
    try {
      const r = await fetch("http://localhost:5000/api/predict",{
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ symptoms: selected, user })
      });
      const d = await r.json();
      if (d.error) setError(d.error);
      else { setResult({...d, timestamp: Date.now()}); setPage("result"); }
    } catch { setError("Server unreachable. Check backend is running."); }
    setLoading(false);
  };

  const reset = () => { setPage("predict"); setResult(null); setSelected([]); setError(""); };

  const downloadPDF = () => {
    generatePDF({ user, result, symptoms: selected, timestamp: result.timestamp });
  };

  const ust = URGENCY_STYLE[result?.urgency] || URGENCY_STYLE.low;

  // ── Result page ──────────────────────────────────────────────
  if (page === "result" && result) return (
    <div style={styles.dashWrap}>
      <Particles/>
      <nav style={styles.nav}>
        <div style={styles.navLogo}><span>🏥</span> MediScan AI</div>
        <div style={{display:"flex",gap:12,alignItems:"center"}}>
          <button style={styles.navBtn} onClick={reset}>← New Analysis</button>
          <span style={styles.navUser}>👤 {user.name}</span>
          <button style={styles.navLogout} onClick={onLogout}>Logout</button>
        </div>
      </nav>

      <div style={{...styles.dashContent, maxWidth:900}}>
        {/* Primary result card */}
        <div style={{...styles.resultCard, borderColor: ust.border, background: ust.bg, animation:"slideUp .5s ease"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:16}}>
            <div>
              <div style={{fontSize:12,fontWeight:700,textTransform:"uppercase",letterSpacing:1,color:ust.text,marginBottom:8}}>
                Primary Diagnosis
              </div>
              <div style={{fontSize:36,fontWeight:800,color:"#0f172a",letterSpacing:-1}}>{result.disease}</div>
              <div style={{fontSize:14,color:"#64748b",marginTop:4}}>Category: {result.category}</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{
                background: ust.badge, color:"#fff",
                borderRadius:20, padding:"6px 18px",
                fontSize:12, fontWeight:700, textTransform:"uppercase", letterSpacing:.8
              }}>{(result.urgency||"low").toUpperCase()} PRIORITY</div>
              <div style={{fontSize:40,fontWeight:900,color:ust.text,marginTop:8}}>{result.confidence}%</div>
              <div style={{fontSize:12,color:"#64748b"}}>confidence</div>
            </div>
          </div>

          {/* Confidence bars */}
          <div style={{marginTop:24}}>
            {result.top3?.map((t,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
                <div style={{fontSize:12,color:"#64748b",minWidth:160,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
                  {i===0?"Primary: ":i===1?"2nd: ":"3rd: "}{t.disease}
                </div>
                <div style={{flex:1,height:8,background:"#e2e8f0",borderRadius:4,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${t.confidence}%`,background:i===0?"linear-gradient(90deg,#0ea5e9,#6366f1)":"#94a3b8",borderRadius:4,transition:"width 1s ease"}}/>
                </div>
                <div style={{fontSize:13,fontWeight:700,color:"#0f172a",minWidth:44,textAlign:"right"}}>{t.confidence}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* Alt diagnoses row */}
        {result.top3?.length > 1 && (
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:14,marginBottom:20}}>
            {result.top3.map((t,i)=>(
              <div key={i} style={styles.altCard}>
                <div style={{fontSize:10,color:"#94a3b8",textTransform:"uppercase",letterSpacing:.8}}>Rank #{i+1}</div>
                <div style={{fontSize:15,fontWeight:700,color:"#0f172a",marginTop:4}}>{t.disease}</div>
                <div style={{fontSize:26,fontWeight:800,color:"#0ea5e9",marginTop:6}}>{t.confidence}%</div>
                <div style={{height:4,background:"#f1f5f9",borderRadius:2,marginTop:10,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${t.confidence}%`,background:"#0ea5e9",borderRadius:2}}/>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:20}}>
          {/* Specialist */}
          <div style={styles.infoCard}>
            <div style={styles.infoCardHead}>Recommended Specialist</div>
            <div style={styles.infoCardBody}>
              <div style={{fontSize:20,fontWeight:700,color:"#0f172a"}}>{result.specialist}</div>
              <div style={{fontSize:13,color:"#64748b",marginTop:6}}>Book an appointment soon</div>
            </div>
          </div>
          {/* Precautions */}
          <div style={styles.infoCard}>
            <div style={styles.infoCardHead}>Precautions & Next Steps</div>
            <div style={styles.infoCardBody}>
              <ul style={{listStyle:"none",padding:0,margin:0}}>
                {result.precautions?.map((p,i)=>(
                  <li key={i} style={{display:"flex",gap:10,padding:"7px 0",borderBottom:"1px solid #f1f5f9",fontSize:13,color:"#374151"}}>
                    <span style={{width:6,height:6,background:"#0ea5e9",borderRadius:"50%",marginTop:6,flexShrink:0}}/>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Symptoms used */}
        <div style={styles.infoCard}>
          <div style={styles.infoCardHead}>Symptoms Analysed ({selected.length})</div>
          <div style={{...styles.infoCardBody, display:"flex",flexWrap:"wrap",gap:8}}>
            {selected.map(s=>(
              <span key={s} style={styles.symPill}>{s}</span>
            ))}
          </div>
        </div>

        {/* Disclaimer + Download */}
        <div style={styles.disclaimer}>
          ⚠ This is an AI-assisted analysis and does not replace professional medical advice. Always consult a qualified doctor.
        </div>

        <div style={{display:"flex",gap:14,marginTop:20}}>
          <button style={styles.btn} onClick={downloadPDF}>⬇ Download PDF Report</button>
          <button style={{...styles.btn, background:"transparent",border:"1px solid #cbd5e1",color:"#475569"}} onClick={reset}>
            ← New Analysis
          </button>
        </div>
      </div>
    </div>
  );

  // ── Prediction input page ────────────────────────────────────
  return (
    <div style={styles.dashWrap}>
      <Particles/>
      <nav style={styles.nav}>
        <div style={styles.navLogo}><span>🏥</span> MediScan AI</div>
        <div style={{display:"flex",gap:12,alignItems:"center"}}>
          <span style={styles.navUser}>👤 {user.name}</span>
          <button style={styles.navLogout} onClick={onLogout}>Logout</button>
        </div>
      </nav>

      <div style={{...styles.dashContent, opacity:animIn?1:0, transform:animIn?"none":"translateY(24px)", transition:"all .6s ease"}}>
        <div style={styles.heroText}>
          <h1 style={styles.heroH1}>Symptom Analysis</h1>
          <p style={styles.heroSub}>Select your symptoms below for an AI-powered disease prediction</p>
        </div>

        {/* Search */}
        <div style={styles.searchWrap}>
          <span style={styles.searchIcon}>🔍</span>
          <input style={styles.searchInput} placeholder="Search symptoms…"
            value={search} onChange={e=>setSearch(e.target.value)}/>
          {search && <span style={{cursor:"pointer",color:"#94a3b8",paddingRight:14}} onClick={()=>setSearch("")}>✕</span>}
        </div>

        {/* Selected chips */}
        {selected.length > 0 && (
          <div style={{marginBottom:16}}>
            <div style={{fontSize:12,fontWeight:600,color:"#64748b",marginBottom:8,textTransform:"uppercase",letterSpacing:.8}}>
              Selected ({selected.length})
            </div>
            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
              {selected.map(s=>(
                <button key={s} onClick={()=>toggle(s)} style={styles.selectedChip}>
                  {s} <span style={{marginLeft:6,opacity:.7}}>✕</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Symptom grid */}
        <div style={styles.symptomGrid}>
          {filtered.slice(0,40).map(s=>(
            <button key={s} style={styles.symptomBtn} onClick={()=>toggle(s)}>
              + {s}
            </button>
          ))}
          {filtered.length === 0 && (
            <div style={{color:"#94a3b8",fontSize:14,padding:"20px 0",gridColumn:"1/-1"}}>No matching symptoms found</div>
          )}
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}

        <div style={{display:"flex",gap:14,alignItems:"center",marginTop:24}}>
          <button style={{...styles.btn, opacity:loading||selected.length<2?.6:1}}
            onClick={predict} disabled={loading||selected.length<2}>
            {loading
              ? <><span style={styles.spinner}/> Analysing…</>
              : `🔍 Predict Disease (${selected.length} selected)`}
          </button>
          {selected.length > 0 && (
            <button style={{...styles.btn,background:"transparent",border:"1px solid #cbd5e1",color:"#64748b"}}
              onClick={()=>{setSelected([]);setError("");}}>
              Clear all
            </button>
          )}
        </div>
        {selected.length < 2 && (
          <p style={{fontSize:12,color:"#94a3b8",marginTop:10}}>Select at least 2 symptoms to run analysis</p>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  ROOT APP
// ══════════════════════════════════════════════════════════════
export default function App() {
  const [screen, setScreen] = useState("login"); // login | register | dashboard
  const [user,   setUser]   = useState(null);

  const handleLogin = (u) => { setUser(u); setScreen("dashboard"); };
  const handleLogout = () => { setUser(null); setScreen("login"); };

  return (
    <div style={{minHeight:"100vh",background:"#0f172a"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        *{box-sizing:border-box;font-family:'Inter',sans-serif}
        body{margin:0;background:#0f172a}
        @keyframes float{0%{transform:translateY(0) scale(1)}100%{transform:translateY(-30px) scale(1.1)}}
        @keyframes slideUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:none}}
        @keyframes spin{to{transform:rotate(360deg)}}
        ::-webkit-scrollbar{width:6px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:#334155;border-radius:3px}
      `}</style>

      {screen === "login"     && <LoginPage    onLogin={handleLogin} onGoRegister={()=>setScreen("register")}/>}
      {screen === "register"  && <RegisterPage onLogin={handleLogin} onGoLogin={()=>setScreen("login")}/>}
      {screen === "dashboard" && <Dashboard    user={user} onLogout={handleLogout}/>}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  STYLES
// ══════════════════════════════════════════════════════════════
const styles = {
  // Auth
  authWrap:{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:"24px",position:"relative",background:"linear-gradient(135deg,#0f172a 0%,#1e3a5f 50%,#0f172a 100%)"},
  authCard:{background:"rgba(255,255,255,.03)",backdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,.08)",borderRadius:24,padding:"44px 48px",width:"100%",maxWidth:460,position:"relative",zIndex:1},
  authLogo:{display:"flex",alignItems:"center",gap:14,marginBottom:28},
  authLogoIcon:{fontSize:36,background:"rgba(14,165,233,.15)",border:"1px solid rgba(14,165,233,.3)",borderRadius:14,width:56,height:56,display:"flex",alignItems:"center",justifyContent:"center"},
  authLogoTitle:{color:"#f1f5f9",fontSize:20,fontWeight:800,letterSpacing:-.5},
  authLogoSub:{color:"#64748b",fontSize:12,marginTop:2},
  authHeading:{color:"#f8fafc",fontSize:26,fontWeight:800,margin:0,letterSpacing:-.5},
  authSubheading:{color:"#64748b",fontSize:14,margin:"8px 0 0"},
  fieldGroup:{marginBottom:16},
  label:{display:"block",fontSize:12,fontWeight:600,color:"#94a3b8",marginBottom:6,textTransform:"uppercase",letterSpacing:.8},
  input:{width:"100%",background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.1)",borderRadius:10,padding:"12px 16px",color:"#f1f5f9",fontSize:14,outline:"none",transition:"border .2s"},
  btn:{display:"flex",alignItems:"center",justifyContent:"center",gap:8,width:"100%",background:"linear-gradient(135deg,#0ea5e9,#6366f1)",border:"none",borderRadius:12,padding:"14px 24px",color:"#fff",fontSize:15,fontWeight:700,cursor:"pointer",transition:"opacity .2s,transform .1s",marginTop:8},
  switchText:{textAlign:"center",color:"#64748b",fontSize:13,marginTop:20},
  link:{color:"#0ea5e9",cursor:"pointer",fontWeight:600},
  errorBox:{background:"rgba(220,38,38,.1)",border:"1px solid rgba(220,38,38,.3)",borderRadius:10,padding:"10px 14px",color:"#f87171",fontSize:13,marginTop:8},
  // Dashboard
  dashWrap:{minHeight:"100vh",background:"linear-gradient(135deg,#0f172a 0%,#1e3a5f 40%,#0f172a 100%)",position:"relative"},
  nav:{background:"rgba(255,255,255,.03)",backdropFilter:"blur(20px)",borderBottom:"1px solid rgba(255,255,255,.06)",padding:"16px 32px",display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,zIndex:10},
  navLogo:{color:"#f1f5f9",fontSize:18,fontWeight:800,display:"flex",alignItems:"center",gap:8},
  navBtn:{background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",borderRadius:8,padding:"8px 16px",color:"#cbd5e1",fontSize:13,cursor:"pointer"},
  navUser:{color:"#94a3b8",fontSize:13},
  navLogout:{background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.2)",borderRadius:8,padding:"8px 16px",color:"#f87171",fontSize:13,cursor:"pointer"},
  dashContent:{maxWidth:820,margin:"0 auto",padding:"40px 24px",position:"relative",zIndex:1},
  heroText:{marginBottom:32},
  heroH1:{color:"#f8fafc",fontSize:34,fontWeight:900,margin:0,letterSpacing:-1},
  heroSub:{color:"#64748b",fontSize:15,marginTop:8},
  searchWrap:{display:"flex",alignItems:"center",background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.1)",borderRadius:12,marginBottom:20,overflow:"hidden"},
  searchIcon:{padding:"0 14px",fontSize:16,color:"#64748b"},
  searchInput:{flex:1,background:"transparent",border:"none",padding:"14px 0",color:"#f1f5f9",fontSize:14,outline:"none"},
  symptomGrid:{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:8,marginBottom:8},
  symptomBtn:{background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.08)",borderRadius:8,padding:"10px 14px",color:"#cbd5e1",fontSize:13,cursor:"pointer",textAlign:"left",transition:"all .2s"},
  selectedChip:{background:"rgba(14,165,233,.15)",border:"1px solid rgba(14,165,233,.35)",borderRadius:20,padding:"6px 14px",color:"#38bdf8",fontSize:13,cursor:"pointer",display:"flex",alignItems:"center"},
  spinner:{width:14,height:14,border:"2px solid rgba(255,255,255,.3)",borderTop:"2px solid #fff",borderRadius:"50%",animation:"spin .7s linear infinite",display:"inline-block"},
  // Result
  resultCard:{border:"1px solid",borderRadius:20,padding:"28px 32px",marginBottom:20,transition:"all .4s"},
  altCard:{background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.08)",borderRadius:14,padding:20},
  infoCard:{background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.08)",borderRadius:14,overflow:"hidden",marginBottom:0},
  infoCardHead:{background:"rgba(255,255,255,.03)",padding:"12px 20px",fontSize:12,fontWeight:700,textTransform:"uppercase",letterSpacing:1,color:"#64748b",borderBottom:"1px solid rgba(255,255,255,.06)"},
  infoCardBody:{padding:"16px 20px"},
  symPill:{background:"rgba(14,165,233,.1)",border:"1px solid rgba(14,165,233,.25)",borderRadius:20,padding:"5px 12px",fontSize:12,color:"#38bdf8"},
  disclaimer:{background:"rgba(234,179,8,.06)",border:"1px solid rgba(234,179,8,.2)",borderRadius:12,padding:"14px 18px",color:"#fbbf24",fontSize:13,marginTop:20,lineHeight:1.6},
};
