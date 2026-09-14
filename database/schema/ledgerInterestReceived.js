const db =
    require("../../db");

async function createLedgerInterestReceivedTable() {
    const sql = `
        CREATE TABLE IF NOT EXISTS ledger_interest_received (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            party_id INTEGER NOT NULL,
            interest_date DATE NOT NULL,
            amount REAL NOT NULL,
            note TEXT,
            created_at DATETIME
                DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME
                DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (
                party_id
            )
                REFERENCES ledger_parties(id)
                ON DELETE CASCADE
        )
    `;

    await db.runAsync(sql);

    console.log(
        "✅ Ledger interest received table ready"
    );
}

async function createLedgerInterestReceivedIndexes() {
    const sql = `
        CREATE INDEX IF NOT EXISTS idx_ledger_interest_received_party_date
        ON ledger_interest_received(party_id, interest_date DESC, id DESC)
    `;

    await db.runAsync(sql);

    console.log(
        "✅ Ledger interest received indexes ready"
    );
}

module.exports =
    createLedgerInterestReceivedTable;

module.exports.createIndexes =
    createLedgerInterestReceivedIndexes;
