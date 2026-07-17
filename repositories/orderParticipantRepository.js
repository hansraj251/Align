const db = require("../db");

exports.addParticipant = (
    orderId,
    staffId
) => {

    return new Promise((resolve, reject) => {

        const sql = `
            INSERT OR IGNORE INTO order_staff_participants (

                order_id,

                staff_id

            )
            VALUES (

                ?,

                ?

            )
        `;

        db.run(
            sql,
            [
                orderId,
                staffId
            ],
            function (err) {

                if (err) {

                    return reject(err);

                }

                resolve(this.changes);

            }
        );

    });

};

exports.getParticipants = (
    orderId
) => {

    return new Promise((resolve, reject) => {

        const sql = `
            SELECT

                staff_id

            FROM order_staff_participants

            WHERE

                order_id = ?
        `;

        db.all(
            sql,
            [
                orderId
            ],
            (err, rows) => {

                if (err) {

                    return reject(err);

                }

                resolve(rows);

            }
        );

    });

};
exports.getParticipantIds = (
    orderId
) => {

    return new Promise((resolve, reject) => {

        const sql = `
            SELECT

                staff_id

            FROM order_staff_participants

            WHERE

                order_id = ?
        `;

        db.all(
            sql,
            [
                orderId
            ],
            (err, rows) => {

                if (err) {

                    return reject(err);

                }

                resolve(
                    rows.map(
                        row => row.staff_id
                    )
                );

            }
        );

    });

};