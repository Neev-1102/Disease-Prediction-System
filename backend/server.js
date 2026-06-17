const express = require("express");
const cors = require("cors");
const { spawn } = require("child_process");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// ─── In-memory user store (replace with DB in production) ───
const users = new Map();
// Pre-seed a demo user
users.set("demo@health.com", { name: "Demo User", password: "demo123", age: "", gender: "" });

// ─── Auth routes ─────────────────────────────────────────────
app.post("/api/register", (req, res) => {
  const { name, email, password, age, gender } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: "Name, email and password are required" });
  if (users.has(email))
    return res.status(409).json({ error: "Email already registered" });
  users.set(email, { name, password, age: age || "", gender: gender || "" });
  res.json({ success: true, message: "Account created successfully" });
});

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  const user = users.get(email);
  if (!user || user.password !== password)
    return res.status(401).json({ error: "Invalid email or password" });
  res.json({
    success: true,
    user: { name: user.name, email, age: user.age, gender: user.gender }
  });
});

// ─── Prediction route ────────────────────────────────────────
app.post("/api/predict", (req, res) => {
  const { symptoms, user } = req.body;

  if (!symptoms || symptoms.length === 0)
    return res.status(400).json({ error: "Select at least one symptom" });

  const payload = JSON.stringify({ symptoms, user: user || {} });

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
    if (errLog) console.error("Python stderr:", errLog);
    if (code !== 0)
      return res.status(500).json({ error: "Model evaluation error", details: errLog });

    try {
      const parsed = JSON.parse(result.trim());
      res.json(parsed);
    } catch (e) {
      res.status(500).json({ error: "Failed to parse prediction output", raw: result });
    }
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
