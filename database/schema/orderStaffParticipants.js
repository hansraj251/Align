const db = require("../../db");

async function createOrderStaffParticipantsTable() {

    const sql = `
        CREATE TABLE IF NOT EXISTS order_staff_participants (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            order_id INTEGER NOT NULL,

            staff_id INTEGER NOT NULL,

            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

            UNIQUE (

                order_id,
                staff_id

            ),

            FOREIGN KEY (order_id)
                REFERENCES orders(id)
                ON DELETE CASCADE,

            FOREIGN KEY (staff_id)
                REFERENCES staff(id)
                ON DELETE CASCADE

        )
    `;

    try {

        await db.runAsync(
            sql
        );

        console.log(
            "✅ Order Staff Participants table ready"
        );

    } catch (err) {

        console.error(
            "❌ Order Staff Participants table creation failed:",
            err.message
        );

        throw err;

    }

}

module.exports =
    createOrderStaffParticipantsTable;