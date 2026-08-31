const express = require("express");
const axios = require("axios");

const app = express();

app.use(express.json());


// ==========================================
// Test Node.js server
// ==========================================

app.get("/", (req, res) => {
    res.json({
        message: "IoT Blockchain Node.js server is running"
    });
});


// ==========================================
// Send IoT data to AO + ANN
// ==========================================

app.post("/iot/predict", async (req, res) => {

    try {

        const { deviceId, features } = req.body;


        // Check device ID
        if (!deviceId) {
            return res.status(400).json({
                error: "deviceId is required"
            });
        }


        // Check features
        if (!features) {
            return res.status(400).json({
                error: "features are required"
            });
        }


        if (features.length !== 10) {
            return res.status(400).json({
                error: "Exactly 10 features are required",
                received: features.length
            });
        }


        // ==========================================
        // Call Python AO + ANN API
        // ==========================================

        const response = await axios.post(
            "http://127.0.0.1:5000/predict",
            {
                deviceId: deviceId,
                features: features
            }
        );


        // ==========================================
        // Return AI result
        // ==========================================

        res.json({
            deviceId: deviceId,
            prediction: response.data.prediction,
            confidence: response.data.confidence,
            p_attack: response.data.p_attack
        });


    } catch (error) {

        console.error(
            "AI API error:",
            error.message
        );


        res.status(500).json({
            error: "Unable to communicate with AI API"
        });
    }
});


// ==========================================
// Start server
// ==========================================

const PORT = 3000;

app.listen(PORT, () => {

    console.log(
        `Node.js server running on http://127.0.0.1:${PORT}`
    );

});