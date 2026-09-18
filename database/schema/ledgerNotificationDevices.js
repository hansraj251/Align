const db = require("../../db");

async function createLedgerNotificationDevicesTable() {

    const sql = `

        CREATE TABLE IF NOT EXISTS ledger_notification_devices (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            account_id INTEGER NOT NULL,

            fcm_token TEXT NOT NULL,

            platform TEXT NOT NULL DEFAULT 'android',

            created_at DATETIME
                DEFAULT CURRENT_TIMESTAMP,

            updated_at DATETIME
                DEFAULT CURRENT_TIMESTAMP,

            UNIQUE (
                account_id,
                fcm_token
            ),

            FOREIGN KEY (account_id)
                REFERENCES align_accounts(id)
                ON DELETE CASCADE
        )

    `;

    try {

        await db.runAsync(sql);

        console.log(
            "✅ Ledger notification devices table ready"
        );

    } catch (err) {

        console.error(
            "❌ Ledger notification devices table creation failed:",
            err.message
        );

        throw err;
    }
}

async function createLedgerNotificationDevicesIndexes() {

    const sql = `

        CREATE INDEX IF NOT EXISTS idx_ledger_notification_devices_account

        ON ledger_notification_devices(account_id)

    `;

    try {

        await db.runAsync(sql);

        console.log(
            "✅ Ledger notification devices indexes ready"
        );

    } catch (err) {

        console.error(
            "❌ Ledger notification devices index creation failed:",
            err.message
        );

        throw err;
    }
}

module.exports =
    createLedgerNotificationDevicesTable;

module.exports.createIndexes =
    createLedgerNotificationDevicesIndexes;
