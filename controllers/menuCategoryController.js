const db = require("../db");

exports.createCategory = (req, res) => {

    const { name, description } = req.body;

    const restaurantId = req.user.restaurantId;

    if (!name || name.trim() === "") {
        return res.status(400).json({
            success: false,
            message: "Category name is required"
        });
    }

    const slug = name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-");

    db.run(
        `INSERT INTO menu_categories
        (
            restaurant_id,
            name,
            slug,
            description
        )
        VALUES (?, ?, ?, ?)`,
        [
            restaurantId,
            name,
            slug,
            description || ""
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
                message: "Category created successfully",
                categoryId: this.lastID
            });

        }
        
    );

};
exports.getCategories = (req, res) => {

    const restaurantId = req.user.restaurantId;

    db.all(
        `SELECT
            id,
            name,
            slug,
            description,
            display_order,
            status
        FROM menu_categories
        WHERE restaurant_id = ?
        ORDER BY display_order, name`,
        [restaurantId],
        (err, categories) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            return res.json({
                success: true,
                categories
            });

        }
    );

};
exports.deleteCategory = (req, res) => {

    const restaurantId = req.user.restaurantId;
    const categoryId = req.params.id;

    db.run(
        `DELETE FROM menu_categories
         WHERE id = ?
         AND restaurant_id = ?`,
        [categoryId, restaurantId],
        function (err) {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            if (this.changes === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Category not found"
                });
            }

            return res.json({
                success: true,
                message: "Category deleted successfully"
            });

        }
    );

};