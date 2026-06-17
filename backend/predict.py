import os
import sys
import json
import joblib
import warnings
import pandas as pd
import numpy as np

warnings.filterwarnings("ignore")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH   = os.path.join(BASE_DIR, "best_bernoulli_naive_bayes_model.pkl")
ENCODER_PATH = os.path.join(BASE_DIR, "label_encoder.pkl")
FEATURES_PATH= os.path.join(BASE_DIR, "final_feature_cols.json")

# ── Load models (runs once per process spawn) ──────────────────
model        = joblib.load(MODEL_PATH)
encoder      = joblib.load(ENCODER_PATH)

with open(FEATURES_PATH, "r") as f:
    feature_names = json.load(f)

# Strip target column if accidentally included
for t in ["Disease","disease","prognosis","Target","target"]:
    if t in feature_names:
        feature_names.remove(t)

# ── Parse input ────────────────────────────────────────────────
payload = {}
if len(sys.argv) > 1:
    try:
        payload = json.loads(sys.argv[1])
    except Exception:
        pass

selected_symptoms = payload.get("symptoms", [])

# ── Build input vector ─────────────────────────────────────────
input_vector = np.zeros(len(feature_names))

for symptom in selected_symptoms:
    s = str(symptom).strip().lower()
    for variant in [s, s.replace(" ", "_"), s.replace("_", " ")]:
        if variant in feature_names:
            input_vector[feature_names.index(variant)] = 1
            break

input_df = pd.DataFrame([input_vector], columns=feature_names)

# ── Predict ────────────────────────────────────────────────────
try:
    probabilities = model.predict_proba(input_df)[0]
    top3_idx      = np.argsort(probabilities)[::-1][:3]

    top3 = [
        {
            "disease":    str(encoder.inverse_transform([i])[0]),
            "confidence": round(float(probabilities[i]) * 100, 2)
        }
        for i in top3_idx
        if probabilities[i] > 0.01          # only meaningful predictions
    ]

    if not top3:
        top3 = [{"disease": str(encoder.inverse_transform([top3_idx[0]])[0]),
                 "confidence": round(float(probabilities[top3_idx[0]]) * 100, 2)}]

    # ── Disease metadata map ───────────────────────────────────
    DISEASE_META = {
        "panic disorder": {
            "specialist": "Psychiatrist",
            "precautions": ["Practice deep breathing", "Avoid caffeine and stimulants",
                            "Seek cognitive behavioral therapy", "Maintain regular sleep schedule"],
            "category": "Mental Health",
            "urgency": "moderate"
        },
        "depression": {
            "specialist": "Psychiatrist / Psychologist",
            "precautions": ["Seek professional therapy", "Maintain daily routine",
                            "Exercise regularly", "Build social support network"],
            "category": "Mental Health",
            "urgency": "moderate"
        },
        "diabetes": {
            "specialist": "Endocrinologist",
            "precautions": ["Monitor blood sugar regularly", "Follow diabetic diet",
                            "Exercise daily", "Take medications as prescribed"],
            "category": "Metabolic",
            "urgency": "high"
        },
        "hypertension": {
            "specialist": "Cardiologist",
            "precautions": ["Reduce sodium intake", "Exercise regularly",
                            "Monitor blood pressure", "Avoid smoking and alcohol"],
            "category": "Cardiovascular",
            "urgency": "high"
        }
    }

    primary_disease = top3[0]["disease"].lower()
    meta = DISEASE_META.get(primary_disease, {
        "specialist": "General Physician",
        "precautions": ["Consult a medical professional", "Monitor symptoms closely",
                        "Ensure adequate rest and hydration", "Avoid self-medication"],
        "category": "General",
        "urgency": "low"
    })

    print(json.dumps({
        "top3":      top3,
        "disease":   top3[0]["disease"],
        "confidence":top3[0]["confidence"],
        "specialist":meta["specialist"],
        "precautions":meta["precautions"],
        "category":  meta["category"],
        "urgency":   meta["urgency"],
        "symptom_count": len(selected_symptoms)
    }))

except Exception as e:
    print(json.dumps({"error": str(e)}))
