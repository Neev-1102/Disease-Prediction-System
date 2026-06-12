const express = require("express");
const cors = require("cors");
const { spawn } = require("child_process");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Disease Prediction API Running");
});

app.post("/predict", (req, res) => {
    const symptoms = req.body.symptoms;

    if (!symptoms || symptoms.length === 0) {
        return res.status(400).json({
            error: "Select at least one symptom"
        });
    }

    // CRITICAL UPDATE: Call python3 and explicitly pass unbuffered environment flags
    const py = spawn("python3", ["predict.py", JSON.stringify(symptoms)], {
        env: { ...process.env, PYTHONUNBUFFERED: "1" }
    });

    let result = "";
    let error = "";

    py.stdout.on("data", (data) => {
        result += data.toString();
    });

    py.stderr.on("data", (data) => {
        error += data.toString();
    });

    py.on("close", (code) => {
        console.log(`Python process exited with code ${code}`);
        console.log("Python Output Matrix:");
        console.log(result);

        if (error) {
            console.log("Python Error Stream Log:");
            console.log(error);
        }

        // Catch explicit script internal execution failures
        if (code !== 0) {
            return res.status(500).json({
                error: "Internal model evaluation error",
                details: error || "Python script exited with an error code."
            });
        }

        try {
            // Reconstruct string stream back to a valid frontend JSON payload
            const parsedData = JSON.parse(result.trim());
            res.json(parsedData);
        } catch (err) {
            console.log("JSON Parse Error on Node Server:", err);
            res.status(500).json({
                error: "Prediction streaming structural failure",
                output: result
            });
        }
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running smoothly on port ${PORT}`);
});