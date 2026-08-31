from flask import Flask, request, jsonify
import numpy as np

from predict import load_model, predict


# ==========================================
# Create Flask application
# ==========================================

app = Flask(__name__)


# ==========================================
# Load trained AO + ANN model
# ==========================================

model, meta = load_model("trained_ann_ao_model.pt")

feature_names = meta["feature_names"]

print("AO + ANN model loaded successfully.")

print("Expected features:")
for i, feature in enumerate(feature_names):
    print(f"{i + 1}. {feature}")


# ==========================================
# Prediction endpoint
# ==========================================

@app.route("/predict", methods=["POST"])
def make_prediction():

    try:

        data = request.get_json()

        if "features" not in data:
            return jsonify({
                "error": "Missing 'features' field"
            }), 400


        features = data["features"]


        # Check number of features
        if len(features) != len(feature_names):
            return jsonify({
                "error": f"Expected {len(feature_names)} features",
                "received": len(features)
            }), 400


        # Convert to NumPy array
        X = np.array(
            features,
            dtype=np.float32
        ).reshape(1, -1)


        # Run AO + ANN prediction
        labels, probabilities = predict(
            model,
            meta,
            X
        )


        label = int(labels[0])
        probability = float(probabilities[0])


        prediction = (
            "ATTACK"
            if label == 1
            else "NORMAL"
        )


        return jsonify({

            "prediction": prediction,

            "confidence": probability,

            "deviceId": data.get(
                "deviceId",
                "UNKNOWN"
            ),

            "features": features

        })


    except Exception as e:

        return jsonify({
            "error": str(e)
        }), 500


# ==========================================
# Health check
# ==========================================

@app.route("/", methods=["GET"])
def home():

    return jsonify({
        "message": "AO + ANN IoT Security API is running"
    })


# ==========================================
# Start server
# ==========================================

if __name__ == "__main__":

    app.run(
        host="127.0.0.1",
        port=5000,
        debug=False
    )