const db = require("../db");

exports.createOrder = (req, res) => {

    const restaurantId = req.user.restaurantId;

    const { table_id } = req.body;

    if (!table_id) {
        return res.status(400).json({
            success: false,
            message: "Table is required"
        });
    }

    db.run(
        `
        INSERT INTO orders
        (
            restaurant_id,
            table_id
        )
        VALUES (?, ?)
        `,
        [
            restaurantId,
            table_id
        ],
        function (err) {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            return res.json({
                success: true,
                message: "Order created successfully",
                orderId: this.lastID
            });

        }
    );

};