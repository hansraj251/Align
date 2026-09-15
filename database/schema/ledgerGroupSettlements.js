const db = require("../../db");

async function createLedgerGroupSettlementsTable() {
    const sql = `
        CREATE TABLE IF NOT EXISTS ledger_group_settlements (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            group_id INTEGER NOT NULL,
            paid_by_member_id INTEGER NOT NULL,
            paid_to_member_id INTEGER NOT NULL,
            amount REAL NOT NULL,
            settlement_date DATE NOT NULL,
            notes TEXT,
            created_at DATETIME
                DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME
                DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (group_id)
                REFERENCES ledger_groups(id)
                ON DELETE CASCADE,
            FOREIGN KEY (paid_by_member_id)
                REFERENCES ledger_group_members(id)
                ON DELETE CASCADE,
            FOREIGN KEY (paid_to_member_id)
                REFERENCES ledger_group_members(id)
                ON DELETE CASCADE
        )
    `;

    await db.runAsync(sql);

    console.log(
        "✅ Ledger group settlements table ready"
    );
}

async function createLedgerGroupSettlementsIndexes() {
    const sql = `
        CREATE INDEX IF NOT EXISTS idx_ledger_group_settlements_group
        ON ledger_group_settlements(group_id)
    `;

    await db.runAsync(sql);

    console.log(
        "✅ Ledger group settlements indexes ready"
    );
}

module.exports =
    createLedgerGroupSettlementsTable;

module.exports.createIndexes =
    createLedgerGroupSettlementsIndexes;
