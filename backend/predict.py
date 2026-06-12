import os
import sys
import json
import pickle
import warnings
import pandas as pd

# Hide sklearn warnings
warnings.filterwarnings("ignore")

# Base directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_PATH = os.path.join(BASE_DIR, "model.pkl")
ENCODER_PATH = os.path.join(BASE_DIR, "label_encoder.pkl")
FEATURES_PATH = os.path.join(BASE_DIR, "feature_names.json")

# Load once
with open(MODEL_PATH, "rb") as f:
    model = pickle.load(f)

with open(ENCODER_PATH, "rb") as f:
    encoder = pickle.load(f)

with open(FEATURES_PATH, "r") as f:
    feature_names = json.load(f)

# Remove column if present
if "Disease" in feature_names:
    feature_names.remove("Disease")

# Read symptoms
selected_symptoms = []

if len(sys.argv) > 1:
    try:
        selected_symptoms = json.loads(sys.argv[1])
    except:
        selected_symptoms = []

# Empty selection
if len(selected_symptoms) == 0:
    print(json.dumps({
        "error": "Select at least one symptom"
    }))
    sys.exit()

# Build vector
input_vector = [0] * len(feature_names)

feature_index = {
    name: idx
    for idx, name in enumerate(feature_names)
}

for symptom in selected_symptoms:
    if symptom in feature_index:
        input_vector[feature_index[symptom]] = 1

# Faster dataframe creation
input_df = pd.DataFrame(
    [input_vector],
    columns=feature_names
)

# Predict
prediction = model.predict(input_df)

disease = encoder.inverse_transform(prediction)[0]

confidence = round(
    float(model.predict_proba(input_df)[0].max()) * 100,
    2
)

print(json.dumps({
    "disease": disease,
    "confidence": confidence,
    "symptoms": selected_symptoms
}))