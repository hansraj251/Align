module.exports = async (db) => {

    try {

        await db.runAsync(`
            ALTER TABLE kitchen_tickets
            ADD COLUMN mode
            TEXT DEFAULT 'kitchen'
        `);

    } catch (err) {

        if (!err.message.includes("duplicate column")) {

            throw err;

        }

    }

};