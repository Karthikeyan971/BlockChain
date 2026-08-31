import pandas as pd
import numpy as np

from predict import load_model, predict


# ==========================================
# Load trained AO + ANN model
# ==========================================

model, meta = load_model("trained_ann_ao_model.pt")

feature_names = meta["feature_names"]

print("Expected features:")
for i, feature in enumerate(feature_names):
    print(f"{i + 1}. {feature}")


# ==========================================
# Load dataset
# ==========================================

df = pd.read_csv("dataset.csv")

print("\nDataset shape:", df.shape)


# ==========================================
# Check required features
# ==========================================

missing = [
    feature for feature in feature_names
    if feature not in df.columns
]

if missing:
    print("\nMissing features:")

    for feature in missing:
        print(feature)

    raise ValueError(
        "Dataset does not contain all required model features."
    )


# ==========================================
# Select model features
# ==========================================

X_real = df[feature_names].copy()


# ==========================================
# Take first 20 real samples
# ==========================================

X_test = X_real.head(20).values.astype(np.float32)


# ==========================================
# Predict
# ==========================================

labels, probabilities = predict(
    model,
    meta,
    X_test
)


# ==========================================
# Display predictions + actual labels
# ==========================================

print("\nPredictions vs Actual Labels")
print("=" * 70)

for i in range(20):

    prediction = "ATTACK" if labels[i] == 1 else "NORMAL"

    actual_value = df.iloc[i]["label"]

    print(
        f"Sample {i + 1:2d} | "
        f"Prediction: {prediction:6s} | "
        f"Probability: {probabilities[i]:.6f} | "
        f"Actual label: {actual_value}"
    )