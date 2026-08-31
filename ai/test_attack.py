import pandas as pd
import numpy as np

from predict import load_model, predict


# Load trained AO + ANN model
model, meta = load_model("trained_ann_ao_model.pt")

feature_names = meta["feature_names"]


# Load dataset
df = pd.read_csv("dataset.csv")


# Get actual attack rows
attack_df = df[df["label"] == 1].head(20)


# Extract the exact 10 features
X_attack = attack_df[feature_names].values.astype(np.float32)


# Predict
labels, probabilities = predict(
    model,
    meta,
    X_attack
)


# Display results
print("\nActual Attack Samples")
print("=" * 70)

for i, (label, probability) in enumerate(
    zip(labels, probabilities)
):

    prediction = "ATTACK" if label == 1 else "NORMAL"

    print(
        f"Sample {i + 1:2d} | "
        f"Prediction: {prediction:6s} | "
        f"p_attack: {probability:.6f} | "
        f"Actual: ATTACK"
    )