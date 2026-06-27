const db = require("../db");

exports.updateStatus = (req, res) => {

    const restaurantId = req.user.restaurantId;

    const orderId = req.params.id;

    const { status } = req.body;

    const allowed = [
        "sent_to_kitchen",
        "preparing",
        "ready",
        "served",
        "paid",
        "cancelled"
    ];

    if (!allowed.includes(status)) {
        return res.status(400).json({
            success: false,
            message: "Invalid status"
        });
    }

    db.run(
        `
        UPDATE orders
        SET status = ?
        WHERE id = ?
          AND restaurant_id = ?
        `,
        [status, orderId, restaurantId],
        function (err) {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            return res.json({
                success: true,
                message: "Status updated"
            });

        }
    );

};