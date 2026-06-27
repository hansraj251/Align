const db = require("../db");

exports.createMenuItem = (req, res) => {

    const restaurantId = req.user.restaurantId;

    const {
        category_id,
        name,
        description,
        price,
        food_type
    } = req.body;

    if (!category_id) {
        return res.status(400).json({
            success: false,
            message: "Category is required"
        });
    }

    if (!name || name.trim() === "") {
        return res.status(400).json({
            success: false,
            message: "Item name is required"
        });
    }

    if (price === undefined || price === "") {
        return res.status(400).json({
            success: false,
            message: "Price is required"
        });
    }

    const slug = name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-");

    db.run(
        `INSERT INTO menu_items
        (
            restaurant_id,
            category_id,
            name,
            slug,
            description,
            price,
            food_type
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
            restaurantId,
            category_id,
            name,
            slug,
            description || "",
            price,
            food_type || "veg"
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
                message: "Menu item created successfully",
                itemId: this.lastID
            });

        }
    );

};
exports.getMenuItems = (req, res) => {

    const restaurantId = req.user.restaurantId;

    db.all(
        `SELECT

            mi.id,
            mi.name,
            mc.name AS category,
            mi.price,
            mi.food_type,
            mi.description,
            mi.is_available

        FROM menu_items mi

        JOIN menu_categories mc
            ON mc.id = mi.category_id

        WHERE mi.restaurant_id = ?

        ORDER BY mc.name, mi.name`,

        [restaurantId],

        (err, items) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            return res.json({
                success: true,
                items
            });

        }
    );

};