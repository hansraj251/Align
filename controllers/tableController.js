const db = require("../db");

exports.createTable = (req, res) => {

    const restaurantId = req.user.restaurantId;

    const {
        name,
        capacity
    } = req.body;

    if (!name || name.trim() === "") {
        return res.status(400).json({
            success: false,
            message: "Table name is required"
        });
    }

    db.get(
    `
    SELECT id
    FROM tables
    WHERE restaurant_id = ?
      AND name = ?
    `,
    [restaurantId, name.trim()],
    (err, row) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        if (row) {
            return res.status(400).json({
                success: false,
                message: "Table name already exists"
            });
        }

        // Yahan INSERT chalega
    }
);

    db.run(
        `
        INSERT INTO tables
        (
            restaurant_id,
            name,
            capacity
        )
        VALUES (?, ?, ?)
        `,
        [
            restaurantId,
            name.trim(),
            capacity || 4
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
                message: "Table created successfully",
                tableId: this.lastID
            });

        }
    );

};
exports.getTables = (req, res) => {

    const restaurantId = req.user.restaurantId;

    db.all(
        `
        SELECT
            id,
            name,
            capacity,
            status
        FROM tables
        WHERE restaurant_id = ?
        ORDER BY name
        `,
        [restaurantId],
        (err, tables) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            return res.json({
                success: true,
                tables
            });

        }
    );

};