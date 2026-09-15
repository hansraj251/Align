const db = require("../../db");

async function createLedgerGroupExpensesTable() {
    const sql = `
        CREATE TABLE IF NOT EXISTS ledger_group_expenses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            group_id INTEGER NOT NULL,
            added_by_account_id INTEGER NOT NULL,
            description TEXT NOT NULL,
            amount REAL NOT NULL,
            expense_date DATE NOT NULL,
            split_type TEXT NOT NULL
                CHECK (
                    split_type IN (
                        'equal',
                        'percentage',
                        'ratio',
                        'custom'
                    )
                ),
            notes TEXT,
            created_at DATETIME
                DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME
                DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (group_id)
                REFERENCES ledger_groups(id)
                ON DELETE CASCADE,
            FOREIGN KEY (added_by_account_id)
                REFERENCES align_accounts(id)
                ON DELETE CASCADE
        )
    `;

    await db.runAsync(sql);

    console.log(
        "✅ Ledger group expenses table ready"
    );
}

async function createLedgerGroupExpensesIndexes() {
    const sql = `
        CREATE INDEX IF NOT EXISTS idx_ledger_group_expenses_group
        ON ledger_group_expenses(group_id)
    `;

    await db.runAsync(sql);

    console.log(
        "✅ Ledger group expenses indexes ready"
    );
}

module.exports =
    createLedgerGroupExpensesTable;

module.exports.createIndexes =
    createLedgerGroupExpensesIndexes;
