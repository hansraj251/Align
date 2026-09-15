const db = require("../../db");

async function createLedgerGroupExpensePaymentsTable() {
    const sql = `
        CREATE TABLE IF NOT EXISTS ledger_group_expense_payments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            expense_id INTEGER NOT NULL,
            member_id INTEGER NOT NULL,
            amount REAL NOT NULL,
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
        "✅ Ledger group expense payments table ready"
    );
}

async function createLedgerGroupExpensePaymentsIndexes() {
    const sql = `
        CREATE INDEX IF NOT EXISTS idx_ledger_group_expense_payments_expense
        ON ledger_group_expense_payments(expense_id)
    `;

    await db.runAsync(sql);

    const memberSql = `
        CREATE INDEX IF NOT EXISTS idx_ledger_group_expense_payments_member
        ON ledger_group_expense_payments(member_id)
    `;

    await db.runAsync(memberSql);

    console.log(
        "✅ Ledger group expense payments indexes ready"
    );
}

module.exports =
    createLedgerGroupExpensePaymentsTable;

module.exports.createIndexes =
    createLedgerGroupExpensePaymentsIndexes;
