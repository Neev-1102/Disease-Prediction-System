import { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import jsPDF from "jspdf";

import symptoms from "./symptoms";
import diseaseInfo from "./diseaseInfo";

// =====================================================================
// AUTOMATED FALLBACK MAPPER FOR ALL 693 DISEASES
// =====================================================================
const getFallbackDiseaseInfo = (diseaseName) => {
  const name = diseaseName.toLowerCase();
  
  // Default values if no rules match
  let details = {
    description: `A medical condition identified as ${diseaseName}. Please monitor your symptoms carefully.`,
    doctor: "General Physician",
    precautions: ["Consult a medical professional", "Monitor symptoms closely", "Ensure adequate rest and hydration"]
  };

  // 1. Skin & Superficial Contexts
  if (/fungal|skin|dermatitis|acne|rash|cutaneous|nail|lesion/.test(name)) {
    details.doctor = "Dermatologist";
    details.precautions = ["Keep the affected skin clean and dry", "Avoid scratching or touching the lesions", "Apply topical barrier or antifungal layers if advised"];
  }
  // 2. Respiratory & Pulmonary Systems
  else if (/sinusitis|bronchitis|cough|asthma|pneumonia|respiratory|lung|throat/.test(name)) {
    details.doctor = "Pulmonologist / ENT Specialist";
    details.precautions = ["Avoid exposure to cold drinks and ambient allergens", "Practice steam inhalation twice daily", "Stay well hydrated", "Wear a face mask in dusty spaces"];
  }
  // 3. Gastrointestinal & Hepatic Pathways
  else if (/gerd|ulcer|stomach|diarrhea|gastric|liver|hepatitis|bowel|nausea/.test(name)) {
    details.doctor = "Gastroenterologist";
    details.precautions = ["Consume smaller, more frequent bland meals", "Strictly avoid spicy, greasy, or acidic foods", "Replenish fluids with oral rehydration solutions"];
  }
  // 4. Neurological & Psychiatric States
  else if (/anxiety|depression|migraine|headache|psychotic|neuralgia|brain|seizure/.test(name)) {
    details.doctor = "Neurologist / Psychiatrist";
    details.precautions = ["Maintain a strict, consistent sleep schedule", "Minimize screen exposure and cognitive strain", "Incorporate structured deep breathing exercises"];
  }
  // 5. Cardiovascular & Circulatory Networks
  else if (/heart|hypertension|cardiac|vascular|artery|blood_pressure/.test(name)) {
    details.doctor = "Cardiologist";
    details.precautions = ["Restrict daily sodium and saturated fat intake", "Avoid sudden or strenuous physical exertion", "Monitor systemic blood pressure metrics regularly"];
  }

  return details;
};

function App() {
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  // Load history from localStorage on initial component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem("history");
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Error parsing history from localStorage", e);
      }
    }
  }, []);

  const options = symptoms.map((symptom) => ({
    value: symptom,
    label: symptom.replaceAll("_", " "),
  }));

  const predictDisease = async () => {
    try {
      const symptomArray = selectedSymptoms.map((item) => item.value);
      if (symptomArray.length === 0) {
        alert("Please select at least one symptom");
        return;
      }

      setLoading(true);

      const res = await axios.post(
        "https://disease-prediction-backend-av56.onrender.com/predict",
        { symptoms: symptomArray }
      );

      setResult(res.data);

      const newHistory = [...history, res.data];
      setHistory(newHistory);
      localStorage.setItem("history", JSON.stringify(newHistory));

    } catch (error) {
      console.error(error);
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

    const symptomText = selectedSymptoms.map((s) => s.label).join(", ");
    doc.text(`Symptoms Provided: ${symptomText}`, 20, 70);

    doc.save(`Disease_Report_${result.disease.replace(/\s+/g, "_")}.pdf`);
  };

  // Get display details: use explicit data if available, otherwise apply rule engine
  const currentInfo = result 
    ? (diseaseInfo[result.disease] || getFallbackDiseaseInfo(result.disease))
    : null;

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
          className="basic-multi-select"
          classNamePrefix="select"
        />

        <button
          onClick={predictDisease}
          disabled={loading}
          className="w-full mt-5 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-200 disabled:bg-blue-400"
        >
          {loading ? "Predicting..." : "Predict Disease"}
        </button>

        {loading && (
          <div className="text-center mt-4 text-blue-600 animate-pulse">
            Predicting disease data...
          </div>
        )}

        {result && (
          <>
            <div className="border rounded-xl p-5 mt-6 bg-slate-50">
              <h2 className="text-2xl font-bold mb-2 text-slate-800">
                Prediction Result
              </h2>

              <p className="text-lg">
                <strong>Disease:</strong> <span className="text-blue-600 capitalize">{result.disease}</span>
              </p>

              <p className="mt-2 text-lg">
                <strong>Confidence:</strong> {result.confidence}%
              </p>

              {/* Parsed numeric value handling for the progress indicator wrapper */}
              <div className="w-full bg-gray-200 rounded-full h-4 mt-3 overflow-hidden">
                <div
                  className="bg-green-500 h-4 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(parseFloat(result.confidence) || 0, 100)}%`,
                  }}
                />
              </div>

              <button
                onClick={downloadReport}
                className="mt-4 bg-green-600 text-white px-4 py-2 rounded lg hover:bg-green-700 transition"
              >
                Download Report
              </button>
            </div>

            {currentInfo && (
              <div className="border rounded-xl p-5 mt-5 bg-white shadow-sm">
                <h3 className="text-xl font-bold mb-3 text-slate-800">
                  Disease Clinical Context
                </h3>

                <p className="text-gray-700 leading-relaxed">
                  {currentInfo.description}
                </p>

                <p className="mt-4 text-lg">
                  <strong>Recommended Specialist:</strong>{" "}
                  <span className="text-amber-700 font-semibold">{currentInfo.doctor}</span>
                </p>

                <h4 className="font-bold mt-4 text-slate-800">
                  Standard Precautions
                </h4>

                <ul className="list-disc ml-5 mt-2 space-y-1 text-gray-600">
                  {currentInfo.precautions.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}

        {history.length > 0 && (
          <div className="border rounded-xl p-5 mt-5 bg-slate-50 max-h-60 overflow-y-auto">
            <h3 className="text-xl font-bold mb-3 text-slate-800">
              Prediction History
            </h3>

            <div className="divide-y divide-gray-200">
              {history.map((item, index) => (
                <div key={index} className="py-2 flex justify-between text-gray-700">
                  <span className="capitalize font-medium">{item.disease}</span>
                  <span className="text-gray-500">{item.confidence}%</span>
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