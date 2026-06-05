import json

with open("feature_names.json", "r") as f:
    features = json.load(f)

print("Total Features:", len(features))
print("Last 5 Features:", features[-5:])
print("Contains Disease:", "Disease" in features)