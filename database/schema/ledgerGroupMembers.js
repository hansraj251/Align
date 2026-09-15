const db = require("../../db");

async function createLedgerGroupMembersTable() {
    const sql = `
        CREATE TABLE IF NOT EXISTS ledger_group_members (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            group_id INTEGER NOT NULL,
            account_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            mobile TEXT,
            email TEXT,
            role TEXT NOT NULL DEFAULT 'member'
                CHECK (
                    role IN (
                        'owner',
                        'member'
                    )
                ),
            status TEXT NOT NULL DEFAULT 'active'
                CHECK (
                    status IN (
                        'pending',
                        'active',
                        'rejected'
                    )
                ),
            joined_at DATETIME,
            created_at DATETIME
                DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME
                DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (group_id)
                REFERENCES ledger_groups(id)
                ON DELETE CASCADE,
            FOREIGN KEY (account_id)
                REFERENCES align_accounts(id)
                ON DELETE CASCADE
        )
    `;

    await db.runAsync(sql);

    console.log(
        "✅ Ledger group members table ready"
    );
}

async function createLedgerGroupMembersIndexes() {
    const sql = `
        CREATE INDEX IF NOT EXISTS idx_ledger_group_members_group
        ON ledger_group_members(group_id)
    `;

    await db.runAsync(sql);

    const accountSql = `
        CREATE INDEX IF NOT EXISTS idx_ledger_group_members_account
        ON ledger_group_members(account_id)
    `;

    await db.runAsync(accountSql);

    console.log(
        "✅ Ledger group members indexes ready"
    );
}

module.exports =
    createLedgerGroupMembersTable;

module.exports.createIndexes =
    createLedgerGroupMembersIndexes;
