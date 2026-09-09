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
        // Serialize all fields deterministically so hash is stable
        const content = JSON.stringify({
            index: this.index,
            timestamp: this.timestamp,
            data: this.data,
            previousHash: this.previousHash,
        });
        return crypto.createHash("sha256").update(content).digest("hex");
    }
}


// ==========================================
// Blockchain Class
// ==========================================

class Blockchain {

    constructor() {
        this.chain = [this._createGenesisBlock()];
    }

    _createGenesisBlock() {
        return new Block(0, new Date().toISOString(), { message: "Genesis Block" }, "0");
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    // Appends a new block; returns the block so caller can log hash/index
    addBlock(data) {
        const prev = this.getLatestBlock();
        const block = new Block(
            this.chain.length,
            new Date().toISOString(),
            data,
            prev.hash
        );
        this.chain.push(block);
        return block;
    }

    isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const cur = this.chain[i];
            const prev = this.chain[i - 1];

            if (cur.hash !== cur.calculateHash()) return false;
            if (cur.previousHash !== prev.hash) return false;
        }
        return true;
    }

    getStats() {
        return {
            chainLength: this.chain.length,
            valid: this.isChainValid(),
            latestHash: this.getLatestBlock().hash,
        };
    }
}


module.exports = { Block, Blockchain };
