const crypto = require("crypto");
const fs     = require("fs");
const path   = require("path");


// ==========================================
// Block Class
// ==========================================

class Block {
    constructor(index, timestamp, data, previousHash = "") {
        this.index        = index;
        this.timestamp    = timestamp;
        this.data         = data;
        this.previousHash = previousHash;
        this.hash         = this.calculateHash();
    }

    calculateHash() {
        const content = JSON.stringify({
            index:        this.index,
            timestamp:    this.timestamp,
            data:         this.data,
            previousHash: this.previousHash,
        });
        return crypto.createHash("sha256").update(content).digest("hex");
    }
}


// ==========================================
// Blockchain Class  (persistent — saved to chain.json)
// ==========================================

class Blockchain {

    constructor(filePath = path.join(__dirname, "chain.json")) {
        this.filePath = filePath;
        this.chain    = this._load();
    }


    // ---- Persistence ----

    _load() {
        if (fs.existsSync(this.filePath)) {
            try {
                const raw    = fs.readFileSync(this.filePath, "utf8");
                const blocks = JSON.parse(raw);

                // Reconstruct Block instances; restore saved hash so
                // isChainValid() can detect any external file tampering
                const chain = blocks.map(b => {
                    const block = new Block(b.index, b.timestamp, b.data, b.previousHash);
                    block.hash  = b.hash;   // preserve the hash that was written at block-creation time
                    return block;
                });

                console.log(`[Blockchain] Loaded ${chain.length} block(s) from ${this.filePath}`);
                return chain;

            } catch (err) {
                console.warn(`[Blockchain] Could not read ${this.filePath}: ${err.message}`);
                console.warn("[Blockchain] Starting with a fresh chain.");
            }
        }

        // First run — create genesis and persist it immediately
        const genesis = this._createGenesisBlock();
        this._write([genesis]);
        console.log(`[Blockchain] New chain created → ${this.filePath}`);
        return [genesis];
    }

    _write(chain) {
        fs.writeFileSync(this.filePath, JSON.stringify(chain, null, 2), "utf8");
    }

    _save() {
        this._write(this.chain);
    }


    // ---- Core operations ----

    _createGenesisBlock() {
        return new Block(0, new Date().toISOString(), { message: "Genesis Block" }, "0");
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    // Appends a block, persists to disk, and returns the new block
    addBlock(data) {
        const prev  = this.getLatestBlock();
        const block = new Block(
            this.chain.length,
            new Date().toISOString(),
            data,
            prev.hash
        );
        this.chain.push(block);
        this._save();
        return block;
    }

    isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const cur  = this.chain[i];
            const prev = this.chain[i - 1];

            // Detect data tampering in this block
            if (cur.hash !== cur.calculateHash()) return false;

            // Detect broken linkage between blocks
            if (cur.previousHash !== prev.hash) return false;
        }
        return true;
    }

    getStats() {
        return {
            chainLength: this.chain.length,
            valid:       this.isChainValid(),
            latestHash:  this.getLatestBlock().hash,
        };
    }
}


module.exports = { Block, Blockchain };
