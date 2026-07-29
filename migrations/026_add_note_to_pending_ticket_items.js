const db = require("../db");

module.exports = async () => {

    const columns =
        await db.allAsync(
            "PRAGMA table_info(kitchen_ticket_items)"
        );

    const hasNote =
        columns.some(
            column => column.name === "note"
        );

    if (hasNote) {

        console.log(
            "✓ 026_add_note_to_pending_ticket_items"
        );

        return;

    }

    await db.runAsync(`
        ALTER TABLE kitchen_ticket_items
        ADD COLUMN note TEXT
    `);

    console.log(
        "✓ 026_add_note_to_pending_ticket_items"
    );

};