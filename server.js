const express = require("express");
const axios = require("axios");
const crypto = require("crypto");
const { Blockchain } = require("./blockchain");

const app = express();
app.use(express.json());

// In-memory ledger — survives the process lifetime
const ledger = new Blockchain();

const AI_API = "http://127.0.0.1:5000/predict";
const PORT = 3000;

// Store feature hash instead of raw values — preserves privacy on-chain
function hashFeatures(features) {
    return crypto.createHash("sha256").update(JSON.stringify(features)).digest("hex");
}


// ==========================================
// Health check
// ==========================================

app.get("/", (req, res) => {
    res.json({
        message: "IoT Blockchain + AI gateway is running",
        ...ledger.getStats(),
    });
});


// ==========================================
// Chain inspection endpoints
// ==========================================

// Full ledger (useful for Postman / Caliper-style testing)
app.get("/chain", (req, res) => {
    res.json({
        ...ledger.getStats(),
        chain: ledger.chain,
    });
});

// Integrity check only
app.get("/chain/validate", (req, res) => {
    const stats = ledger.getStats();
    res.json({
        valid: stats.valid,
        chainLength: stats.chainLength,
        latestHash: stats.latestHash,
    });
});

// Most recent block
app.get("/chain/latest", (req, res) => {
    res.json(ledger.getLatestBlock());
});


// ==========================================
// IoT prediction + blockchain audit log
//
// Architecture (paper Layers 3 & 4):
//   Layer 4 (AI) → runs ANN-AO inference
//   Layer 3 (Blockchain) → records the event immutably
// ==========================================

app.post("/iot/predict", async (req, res) => {

    const { deviceId, features } = req.body;

    if (!deviceId) {
        return res.status(400).json({ error: "deviceId is required" });
    }
    if (!features) {
        return res.status(400).json({ error: "features are required" });
    }
    if (features.length !== 10) {
        return res.status(400).json({
            error: "Exactly 10 features are required",
            received: features.length,
        });
    }

    try {

        // Layer 4 — AI inference
        const aiResponse = await axios.post(AI_API, { deviceId, features });
        const { prediction, confidence, p_attack } = aiResponse.data;

        // Layer 3 — immutable audit log of every detection event
        const block = ledger.addBlock({
            deviceId,
            featuresHash: hashFeatures(features),   // raw features stay off-chain
            prediction,
            confidence,
            p_attack,
            timestamp: new Date().toISOString(),
        });

        res.json({
            deviceId,
            prediction,
            confidence,
            p_attack,
            blockchain: {
                blockIndex: block.index,
                blockHash: block.hash,
                chainLength: ledger.chain.length,
                chainValid: ledger.isChainValid(),
            },
        });

    } catch (error) {

        console.error("AI API error:", error.message);

        // Log the failed attempt too — tamper-proof record of all traffic
        ledger.addBlock({
            deviceId,
            featuresHash: hashFeatures(features),
            prediction: "ERROR",
            error: error.message,
            timestamp: new Date().toISOString(),
        });

        res.status(500).json({
            error: "AI API unavailable",
            details: error.message,
        });
    }
});


// ==========================================
// Start server
// ==========================================

app.listen(PORT, () => {
    console.log(`Blockchain + AI gateway running on http://127.0.0.1:${PORT}`);
    console.log(`  POST /iot/predict   — classify IoT event + log to chain`);
    console.log(`  GET  /chain         — view full ledger`);
    console.log(`  GET  /chain/validate — integrity check`);
    console.log(`  GET  /chain/latest  — most recent block`);
});
