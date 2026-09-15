const db = require("../../db");

async function createLedgerGroupsTable() {
    const sql = `
        CREATE TABLE IF NOT EXISTS ledger_groups (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            business_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            description TEXT,
            status TEXT NOT NULL DEFAULT 'active',
            created_at DATETIME
                DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME
                DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (business_id)
                REFERENCES ledger_businesses(id)
                ON DELETE CASCADE
        )
    `;

    await db.runAsync(sql);

    console.log(
        "✅ Ledger groups table ready"
    );
}

async function createLedgerGroupsIndexes() {
    const sql = `
        CREATE INDEX IF NOT EXISTS idx_ledger_groups_business
        ON ledger_groups(business_id)
    `;

    await db.runAsync(sql);

    console.log(
        "✅ Ledger groups indexes ready"
    );
}

module.exports =
    createLedgerGroupsTable;

module.exports.createIndexes =
    createLedgerGroupsIndexes;
