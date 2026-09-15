const db = require("../../db");

async function createLedgerGroupInvitationsTable() {
    const sql = `
        CREATE TABLE IF NOT EXISTS ledger_group_invitations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            group_id INTEGER NOT NULL,
            invited_by_account_id INTEGER NOT NULL,
            invited_account_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            mobile TEXT,
            email TEXT,
            status TEXT NOT NULL DEFAULT 'pending'
                CHECK (
                    status IN (
                        'pending',
                        'accepted',
                        'rejected'
                    )
                ),
            created_at DATETIME
                DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME
                DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (group_id)
                REFERENCES ledger_groups(id)
                ON DELETE CASCADE,
            FOREIGN KEY (invited_by_account_id)
                REFERENCES align_accounts(id)
                ON DELETE CASCADE,
            FOREIGN KEY (invited_account_id)
                REFERENCES align_accounts(id)
                ON DELETE CASCADE
        )
    `;

    await db.runAsync(sql);

    console.log(
        "✅ Ledger group invitations table ready"
    );
}

async function createLedgerGroupInvitationsIndexes() {
    const sql = `
        CREATE INDEX IF NOT EXISTS idx_ledger_group_invitations_group
        ON ledger_group_invitations(group_id)
    `;

    await db.runAsync(sql);

    const accountSql = `
        CREATE INDEX IF NOT EXISTS idx_ledger_group_invitations_account
        ON ledger_group_invitations(invited_account_id)
    `;

    await db.runAsync(accountSql);

    console.log(
        "✅ Ledger group invitations indexes ready"
    );
}

module.exports =
    createLedgerGroupInvitationsTable;

module.exports.createIndexes =
    createLedgerGroupInvitationsIndexes;
