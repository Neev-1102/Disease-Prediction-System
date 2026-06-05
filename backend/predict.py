import os
import sys
import json
import pickle
import pandas as pd

# Base directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# File paths
MODEL_PATH = os.path.join(BASE_DIR, "model.pkl")
ENCODER_PATH = os.path.join(BASE_DIR, "label_encoder.pkl")
FEATURES_PATH = os.path.join(BASE_DIR, "feature_names.json")

# Load model and encoder
model = pickle.load(open(MODEL_PATH, "rb"))
encoder = pickle.load(open(ENCODER_PATH, "rb"))

# Load feature names
with open(FEATURES_PATH, "r") as f:
    feature_names = json.load(f)

# Remove Disease column if present
if "Disease" in feature_names:
    feature_names.remove("Disease")

# Get symptoms from Node.js
if len(sys.argv) > 1:
    selected_symptoms = json.loads(sys.argv[1])
else:
    selected_symptoms = ["itching", "skin_rash"]

# Create input vector
input_vector = [0] * len(feature_names)

for symptom in selected_symptoms:
    if symptom in feature_names:
        index = feature_names.index(symptom)
        input_vector[index] = 1

# Convert to DataFrame
input_df = pd.DataFrame(
    [input_vector],
    columns=feature_names
)

# Predict disease
prediction = model.predict(input_df)

# Decode disease name
disease = encoder.inverse_transform(prediction)[0]

# Confidence score
confidence = float(
    max(model.predict_proba(input_df)[0]) * 100
)

# JSON response
result = {
    "disease": disease,
    "confidence": round(confidence, 2),
    "symptoms": selected_symptoms
}
# IMPORTANT: Only print JSON
print(json.dumps(result))