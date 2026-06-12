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

    const symptoms = req.body.symptoms;

    const py = spawn("python", [
        "predict.py",
        JSON.stringify(symptoms)
    ]);

    let result = "";
    let error = "";

    py.stdout.on("data", (data) => {
        result += data.toString();
    });

    py.stderr.on("data", (data) => {
        error += data.toString();
    });

    py.on("close", (code) => {

        console.log("Python Output:");
        console.log(result);

        if (error) {
            console.log("Python Error:");
            console.log(error);
        }

        try {
            res.json(JSON.parse(result));
        } catch (err) {
            console.log("JSON Parse Error:", err);

            res.status(500).json({
                error: "Prediction failed",
                output: result
            });
        }
    });
});

app.listen(5000, () => {
    console.log("Server running on port 5000");
});