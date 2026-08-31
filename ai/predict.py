"""
predict.py — Load a saved checkpoint and classify new feature rows.

Usage:
    from predict import load_model, predict
    model, meta = load_model("trained_ann_ao_model.pt")
    predict(model, meta, X_new)   # X_new: (n_samples, 10) raw feature values
"""

import numpy as np
import torch
from model import IntrusionANN


def load_model(path="trained_ann_ao_model.pt"):
    ckpt = torch.load(path, weights_only=False)
    model = IntrusionANN(n_features=len(ckpt["feature_names"]), hidden=ckpt["hidden"])
    model.load_state_dict(ckpt["model_state"])
    model.eval()
    return model, ckpt


def predict(model, meta, X_raw: np.ndarray, threshold=0.5):
    X = (X_raw - meta["scaler_mean"]) / meta["scaler_scale"]
    with torch.no_grad():
        probs = torch.sigmoid(model(torch.tensor(X, dtype=torch.float32))).numpy()
    labels = (probs >= threshold).astype(int)  # 0 = normal, 1 = attack
    return labels, probs


if __name__ == "__main__":
    model, meta = load_model()
    print("Loaded model. Feature order:", meta["feature_names"])
    dummy = np.random.default_rng(0).gamma(2.0, 50.0, size=(5, len(meta["feature_names"])))
    labels, probs = predict(model, meta, dummy)
    for i, (lab, p) in enumerate(zip(labels, probs)):
        print(f"sample {i}: {'ATTACK' if lab else 'normal'}  (p_attack={p:.3f})")