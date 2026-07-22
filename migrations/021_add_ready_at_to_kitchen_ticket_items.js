module.exports = async (db) => {

    try {

        await db.runAsync(`
            ALTER TABLE kitchen_ticket_items
            ADD COLUMN ready_at DATETIME
        `);

    } catch (err) {

        if (!err.message.includes("duplicate column")) {

            throw err;

        }

    }

};