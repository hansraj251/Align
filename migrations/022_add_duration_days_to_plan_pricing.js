module.exports = async (db) => {

    try {

        await db.runAsync(`
            ALTER TABLE plan_pricing
            ADD COLUMN duration_days INTEGER
        `);

    } catch (err) {

        if (!err.message.includes("duplicate column")) {

            throw err;

        }

    }

};