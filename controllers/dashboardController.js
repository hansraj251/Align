const db = require("../db");

exports.getDashboard = (req, res) => {

    const restaurantId = req.user.restaurantId;

    db.get(
        `
        SELECT
            (
                SELECT COUNT(*)
                FROM menu_categories
                WHERE restaurant_id = ?
            ) AS categories,

            (
                SELECT COUNT(*)
                FROM menu_items
                WHERE restaurant_id = ?
            ) AS menuItems
        `,
        [
            restaurantId,
            restaurantId
        ],
        (err, row) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            return res.json({
                success: true,
                todaySales: 0,
                todayOrders: 0,
                categories: row.categories,
                menuItems: row.menuItems
            });

        }
    );

};