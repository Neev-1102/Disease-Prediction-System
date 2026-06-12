import os
import sys
import json
import pickle
import warnings
import pandas as pd
import numpy as np

# Hide sklearn warnings
warnings.filterwarnings("ignore")

# Base directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_PATH = os.path.join(BASE_DIR, "best_bernoulli_naive_bayes_model.pkl")
ENCODER_PATH = os.path.join(BASE_DIR, "label_encoder.pkl")
FEATURES_PATH = os.path.join(BASE_DIR, "final_feature_cols.json")

# Load once
with open(MODEL_PATH, "rb") as f:
    model = pickle.load(f)

with open(ENCODER_PATH, "rb") as f:
    encoder = pickle.load(f)

with open(FEATURES_PATH, "r") as f:
    feature_names = json.load(f)

# Remove target label column if accidentally included in feature list blueprint
if "Disease" in feature_names:
    feature_names.remove("Disease")

# Read incoming symptoms array safely
selected_symptoms = []
if len(sys.argv) > 1:
    try:
        selected_symptoms = json.loads(sys.argv[1])
    except:
        selected_symptoms = []

# Empty validation
if len(selected_symptoms) == 0:
    print(json.dumps({
        "error": "Select at least one symptom"
    }))
    sys.exit()

# Build base feature dictionary template initialized to 0
processed_features = {name: 0 for name in feature_names}

# Flag provided user symptoms as active (handles both standard names and underscore replacements)
for symptom in selected_symptoms:
    symptom_clean = str(symptom).strip().lower()
    symptom_underscore = symptom_clean.replace(" ", "_")
    
    if symptom_clean in processed_features:
        processed_features[symptom_clean] = 1
    elif symptom_underscore in processed_features:
        processed_features[symptom_underscore] = 1

# =====================================================================
# CRITICAL FIX: STEP 5 DYNAMIC FEATURE ENGINEERING
# =====================================================================
# Make sure these specific names match what you engineered in Step 5
PAIN_SYMPTOMS = ['headache', 'back_pain', 'chest_pain', 'joint_pain']
RESP_SYMPTOMS = ['cough', 'difficulty_speaking', 'shortness_of_breath']
DIGEST_SYMPTOMS = ['stomach_ache', 'nausea', 'vomiting', 'diarrhea']

if 'symptom_count' in processed_features:
    processed_features['symptom_count'] = len(selected_symptoms)

if 'pain_symptom_score' in processed_features:
    processed_features['pain_symptom_score'] = sum(processed_features.get(s, 0) for s in PAIN_SYMPTOMS if s in processed_features)

if 'respiratory_symptom_score' in processed_features:
    processed_features['respiratory_symptom_score'] = sum(processed_features.get(s, 0) for s in RESP_SYMPTOMS if s in processed_features)

if 'digestive_symptom_score' in processed_features:
    processed_features['digestive_symptom_score'] = sum(processed_features.get(s, 0) for s in DIGEST_SYMPTOMS if s in processed_features)

# Arrange the dictionary map values into a strict structured ordered list matching the feature list blueprint
input_vector = [processed_features[name] for name in feature_names]

# Structured DataFrame creation matching exact model properties
input_df = pd.DataFrame([input_vector], columns=feature_names)

try:
    # Model evaluation
    prediction = model.predict(input_df)
    disease = encoder.inverse_transform(prediction)[0]
    
    confidence = round(
        float(model.predict_proba(input_df)[0].max()) * 100,
        2
    )

    # Return pure clean output matching what your Node.js JSON parser expects
    print(json.dumps({
        "disease": str(disease),
        "confidence": f"{confidence}",
        "symptoms": selected_symptoms
    }))

except Exception as e:
    print(json.dumps({
        "error": "Model prediction failure step execution",
        "details": str(e)
    }))