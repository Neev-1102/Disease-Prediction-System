import os
import sys
import json
import joblib  # Using joblib to match your Colab export!
import warnings
import pandas as pd
import numpy as np
print("DEBUG RECEIVED:", sys.argv)

warnings.filterwarnings("ignore")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "best_bernoulli_naive_bayes_model.pkl")
ENCODER_PATH = os.path.join(BASE_DIR, "label_encoder.pkl")
FEATURES_PATH = os.path.join(BASE_DIR, "final_feature_cols.json")

# Load your joblib files safely
model = joblib.load(MODEL_PATH)
encoder = joblib.load(ENCODER_PATH)

with open(FEATURES_PATH, "r") as f:
    feature_names = json.load(f)

# Safety check: Remove target column from blueprint list if accidentally included
for target_name in ["Disease", "disease", "prognosis", "Target", "target"]:
    if target_name in feature_names:
        feature_names.remove(target_name)

# Get symptoms passed from node server
selected_symptoms = []
if len(sys.argv) > 1:
    try:
        selected_symptoms = json.loads(sys.argv[1])
    except:
        pass

# Initialize empty row matching exact number of training feature dimensions
input_vector = np.zeros(len(feature_names))

# Turn on the 1s for selected symptoms with strict string-cleaning fallbacks
for symptom in selected_symptoms:
    s_clean = str(symptom).strip().lower()
    s_underscore = s_clean.replace(" ", "_")
    s_space = s_clean.replace("_", " ")
    
    if s_clean in feature_names:
        idx = feature_names.index(s_clean)
        input_vector[idx] = 1
    elif s_underscore in feature_names:
        idx = feature_names.index(s_underscore)
        input_vector[idx] = 1
    elif s_space in feature_names:
        idx = feature_names.index(s_space)
        input_vector[idx] = 1

# Convert to DataFrame for the model
input_df = pd.DataFrame([input_vector], columns=feature_names)

try:
    prediction = model.predict(input_df)
    disease = encoder.inverse_transform(prediction)[0]
    
    # Calculate probability matrix safely
    probabilities = model.predict_proba(input_df)[0]
    confidence = round(float(probabilities.max()) * 100, 2)

    # Return clean JSON back to server.js
    print(json.dumps({
        "disease": str(disease),
        "confidence": str(confidence)
    }))
except Exception as e:
    print(json.dumps({"error": str(e)}))