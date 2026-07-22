module.exports = async (db) => {

    try {

        await db.runAsync(`
            ALTER TABLE staff
            ADD COLUMN fcm_token TEXT
        `);

    } catch (err) {

        if (!err.message.includes("duplicate column")) {

            throw err;

        }

    }

};