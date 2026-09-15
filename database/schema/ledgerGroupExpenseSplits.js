const db = require("../../db");

async function createLedgerGroupExpenseSplitsTable() {
    const sql = `
        CREATE TABLE IF NOT EXISTS ledger_group_expense_splits (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            expense_id INTEGER NOT NULL,
            member_id INTEGER NOT NULL,
            split_value REAL NOT NULL,
            share_amount REAL NOT NULL,
            created_at DATETIME
                DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME
                DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (expense_id)
                REFERENCES ledger_group_expenses(id)
                ON DELETE CASCADE,
            FOREIGN KEY (member_id)
                REFERENCES ledger_group_members(id)
                ON DELETE CASCADE
        )
    `;

    await db.runAsync(sql);

    console.log(
        "✅ Ledger group expense splits table ready"
    );
}

async function createLedgerGroupExpenseSplitsIndexes() {
    const sql = `
        CREATE INDEX IF NOT EXISTS idx_ledger_group_expense_splits_expense
        ON ledger_group_expense_splits(expense_id)
    `;

    await db.runAsync(sql);

    const memberSql = `
        CREATE INDEX IF NOT EXISTS idx_ledger_group_expense_splits_member
        ON ledger_group_expense_splits(member_id)
    `;

    await db.runAsync(memberSql);

    console.log(
        "✅ Ledger group expense splits indexes ready"
    );
}

module.exports =
    createLedgerGroupExpenseSplitsTable;

module.exports.createIndexes =
    createLedgerGroupExpenseSplitsIndexes;
