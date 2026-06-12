import { useState } from "react";
import axios from "axios";
import Select from "react-select";
import jsPDF from "jspdf";

import symptoms from "./symptoms";
import diseaseInfo from "./diseaseInfo";

function App() {
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const options = symptoms.map((symptom) => ({
    value: symptom,
    label: symptom.replaceAll("_", " "),
  }));

  const predictDisease = async () => {
    try {
      setLoading(true);

      const symptomArray = selectedSymptoms.map(
        (item) => item.value
      );
        if (symptomArray.length === 0) {
  alert("Please select at least one symptom");
  return;
}

      const res = await axios.post(
        "https://disease-prediction-backend-av56.onrender.com/predict",
        {
          symptoms: symptomArray,
        }
      );

      setResult(res.data);

      const newHistory = [...history, res.data];
      setHistory(newHistory);

      localStorage.setItem(
        "history",
        JSON.stringify(newHistory)
      );

    } catch (error) {
      console.log(error);
      alert("Prediction Failed");
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    if (!result) return;

    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Disease Prediction Report", 20, 20);

    doc.setFontSize(12);
    doc.text(`Disease: ${result.disease}`, 20, 40);
    doc.text(`Confidence: ${result.confidence}%`, 20, 50);

    doc.text(
      `Symptoms: ${selectedSymptoms
        .map((s) => s.value)
        .join(", ")}`,
      20,
      70
    );

    doc.save("Disease_Report.pdf");
  };

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center items-center p-5">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-4xl">

        <h1 className="text-4xl font-bold text-center mb-4">
          Disease Prediction System
        </h1>

        <p className="text-center text-gray-500 mb-6">
          Select symptoms and predict possible disease
        </p>

        <Select
          isMulti
          options={options}
          onChange={setSelectedSymptoms}
          placeholder="Select Symptoms..."
        />

        <button
          onClick={predictDisease}
          disabled={loading}
          className="w-full mt-5 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
        >
          {loading ? "Predicting..." : "Predict Disease"}
        </button>

        {loading && (
          <div className="text-center mt-4 text-blue-600">
            Predicting disease...
          </div>
        )}

        {result && (
          <>
            <div className="border rounded-xl p-5 mt-6">
              <h2 className="text-2xl font-bold mb-2">
                Prediction Result
              </h2>

              <p>
                <strong>Disease:</strong> {result.disease}
              </p>

              <p className="mt-2">
                <strong>Confidence:</strong>{" "}
                {result.confidence}%
              </p>

              <div className="w-full bg-gray-200 rounded-full h-4 mt-3">
                <div
                  className="bg-green-500 h-4 rounded-full"
                  style={{
                    width: `${result.confidence}%`,
                  }}
                />
              </div>

              <button
                onClick={downloadReport}
                className="mt-4 bg-green-600 text-white px-4 py-2 rounded"
              >
                Download Report
              </button>
            </div>

            {diseaseInfo[result.disease] && (
              <div className="border rounded-xl p-5 mt-5">
                <h3 className="text-xl font-bold mb-3">
                  Disease Information
                </h3>

                <p>
                  {diseaseInfo[result.disease].description}
                </p>

                <p className="mt-3">
                  <strong>Recommended Doctor:</strong>{" "}
                  {diseaseInfo[result.disease].doctor}
                </p>

                <h3 className="font-bold mt-4">
                  Precautions
                </h3>

                <ul className="list-disc ml-5 mt-2">
                  {diseaseInfo[result.disease].precautions.map(
                    (item, index) => (
                      <li key={index}>{item}</li>
                    )
                  )}
                </ul>
              </div>
            )}
          </>
        )}

        {history.length > 0 && (
          <div className="border rounded-xl p-5 mt-5">
            <h3 className="text-xl font-bold mb-3">
              Prediction History
            </h3>

            {history.map((item, index) => (
              <div
                key={index}
                className="border-b py-2"
              >
                {item.disease} ({item.confidence}%)
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

export default App;