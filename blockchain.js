const crypto = require("crypto");


// ==========================================
// Block Class
// ==========================================

class Block {
    constructor(index, timestamp, data, previousHash = "") {
        this.index = index;
        this.timestamp = timestamp;
        this.data = data;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
    }

    calculateHash() {
        return crypto
            .createHash("sha256")
            .update(
                this.index +
                this.timestamp +
                JSON.stringify(this.data) +
                this.previousHash
            )
            .digest("hex");
    }
}


// ==========================================
// Blockchain Class
// ==========================================

class Blockchain {

    constructor() {
        this.chain = [this.createGenesisBlock()];
    }


    // Create the first block
    createGenesisBlock() {
        return new Block(
            0,
            new Date().toISOString(),
            {
                message: "Genesis Block"
            },
            "0"
        );
    }


    // Get the latest block
    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }


    // Add a new block
    addBlock(data) {

        const previousBlock = this.getLatestBlock();

        const newBlock = new Block(
            this.chain.length,
            new Date().toISOString(),
            data,
            previousBlock.hash
        );

        this.chain.push(newBlock);
    }


    // Validate the entire blockchain
    isChainValid() {

        for (let i = 1; i < this.chain.length; i++) {

            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];


            // Check whether block data was modified
            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }


            // Check whether blocks are properly connected
            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
        }

        return true;
    }
}


// ==========================================
// Create Blockchain
// ==========================================

const myBlockchain = new Blockchain();


// ==========================================
// IoT Security Events
// ==========================================


// Event 1
myBlockchain.addBlock({

    deviceId: "ESP32_01",

    prediction: "ATTACK",

    attackType: "DoS",

    confidence: 0.96,

    timestamp: new Date().toISOString()
});


// Event 2
myBlockchain.addBlock({

    deviceId: "ESP32_02",

    prediction: "NORMAL",

    attackType: "None",

    confidence: 0.98,

    timestamp: new Date().toISOString()
});


// Event 3
myBlockchain.addBlock({

    deviceId: "ESP32_03",

    prediction: "ATTACK",

    attackType: "Scanning",

    confidence: 0.91,

    timestamp: new Date().toISOString()
});


// ==========================================
// Validate Blockchain
// ==========================================

console.log(
    "Blockchain valid:",
    myBlockchain.isChainValid()
);


// ==========================================
// Display Blockchain
// ==========================================

console.log(
    JSON.stringify(myBlockchain, null, 4)
);