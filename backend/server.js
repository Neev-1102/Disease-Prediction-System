const express = require("express");
const cors = require("cors");
const { spawn } = require("child_process");
const path = require("path");

const app = express();

// ─── MIDDLEWARE SETUP ──────────────────────────────────────────
app.use(cors());
app.use(express.json());

// Base root status route for deployment verification checks
app.get("/", (req, res) => {
  res.send("MediScan AI Disease Prediction Backend Server Running Smoothly.");
});

// ─── IN-MEMORY USER STORAGE (Replace with DB in production) ───
const users = new Map();

// Pre-seed the standardized platform demo account framework
users.set("demo@health.com", { 
  name: "Demo User", 
  password: "demo123", 
  age: "30", 
  gender: "Male" 
});

// ─── AUTHENTICATION ENDPOINTS ──────────────────────────────────
app.post("/api/register", (req, res) => {
  const { name, email, password, age, gender } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email and password are required" });
  }
  
  if (users.has(email)) {
    return res.status(409).json({ error: "Email already registered" });
  }
  
  // Register new user parameters securely to map dictionary memory
  users.set(email, { name, password, age: age || "", gender: gender || "" });
  res.json({ success: true, message: "Account created successfully" });
});

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  const user = users.get(email);
  
  if (!user || user.password !== password) {
    return res.status(401).json({ error: "Invalid email or password" });
  }
  
  res.json({
    success: true,
    user: { name: user.name, email, age: user.age, gender: user.gender }
  });
});

// ─── CORE PREDICTION ML ROUTE ENVELOPE ─────────────────────────
app.post("/api/predict", (req, res) => {
  const { symptoms, user } = req.body;

  // Verify that frontend data payload array exists safely
  if (!symptoms || symptoms.length === 0) {
    return res.status(400).json({ error: "Select at least one symptom" });
  }

  // Construct structured object payload to pass downstream to predict.py
  const payload = JSON.stringify({ symptoms, user: user || {} });

  // Spawn Python unbuffered process shell execution mapping
  const py = spawn("python3", [
    path.join(__dirname, "predict.py"),
    payload
  ], {
    env: { ...process.env, PYTHONUNBUFFERED: "1" }
  });

  let result = "";
  let errLog = "";

  py.stdout.on("data", (d) => (result += d.toString()));
  py.stderr.on("data", (d) => (errLog += d.toString()));

  py.on("close", (code) => {
    if (errLog) console.error("Python Standard Error Log:", errLog);
    
    // Check if the script runtime exited with operational code block anomalies
    if (code !== 0) {
      return res.status(500).json({ 
        error: "Internal model execution failure", 
        details: errLog || "Script exited with an error code." 
      });
    }

    try {
      // Reconstruct incoming unbuffered script stdout string matrix back to clean JSON
      const parsed = JSON.parse(result.trim());
      res.json(parsed);
    } catch (e) {
      console.error("JSON Parsing Failure on Node Engine Stream:", e);
      res.status(500).json({ 
        error: "Prediction data packet construction failed", 
        raw: result 
      });
    }
  });
});

// ─── SERVER INITIATION METRICS ─────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ MediScan Server running smoothly on port ${PORT}`));