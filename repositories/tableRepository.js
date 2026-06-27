const db = require("../db");

exports.updateStatus = async (
    tableId,
    status
) => {

    await db.runAsync(
        `
        UPDATE tables
        SET status = ?
        WHERE id = ?
        `,
        [
            status,
            tableId
        ]
    );

};