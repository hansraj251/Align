const db = require("../db");

exports.getKitchenOrders = (req, res) => {

    const restaurantId = req.user.restaurantId;

    db.all(
        `
        SELECT
            o.id,
            o.order_number,
            o.table_id,
            o.status,
            o.total,
            o.created_at,
            t.name AS table_name
        FROM orders o
        JOIN tables t
            ON t.id = o.table_id
        WHERE
            o.restaurant_id = ?
            AND o.status IN (

    'sent_to_kitchen',

    'preparing'

)
        ORDER BY o.created_at
        `,
        [restaurantId],
        (err, rows) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            return res.json({
                success: true,
                orders: rows
            });

        }
    );

};