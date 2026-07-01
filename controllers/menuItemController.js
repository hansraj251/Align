const menuItemService =
    require("../services/menuItemService");

exports.createMenuItem = async (req, res) => {

    try {

        const restaurantId =
            req.user.restaurantId;

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

        const result =
            await menuItemService.createMenuItem(

                restaurantId,

                category_id,

                name,

                price,

                food_type || "veg",

                description

            );

        return res.json(result);

    } catch (err) {

        return res.status(500).json({

            success: false,

            message: err.message

        });

    }

};
exports.getMenuItems = async (req, res) => {

    try {

        const result =
            await menuItemService.getMenuItems(
                req.user.restaurantId
            );

        return res.json(result);

    } catch (err) {

        return res.status(500).json({

            success: false,

            message: err.message

        });

    }

};
exports.updateMenuItem = async (req, res) => {

    try {

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

        const result =
            await menuItemService.updateMenuItem(

                req.user.restaurantId,

                req.params.id,

                category_id,

                name,

                price,

                food_type || "veg",

                description

            );

        return res.json(result);

    } catch (err) {

        return res.status(500).json({

            success: false,

            message: err.message

        });

    }

};

exports.deleteMenuItem = async (req, res) => {

    try {

        const result =
            await menuItemService.deleteMenuItem(

                req.user.restaurantId,

                req.params.id

            );

        return res.json(result);

    } catch (err) {

    if (
        err.message.includes(
            "FOREIGN KEY constraint failed"
        )
    ) {

        return res.status(400).json({

            success: false,

            message:
                "This menu item cannot be deleted because it has already been used in orders. Mark it as Not Available instead."

        });

    }

    return res.status(500).json({

        success: false,

        message: err.message

    });

}

};

exports.updateAvailability =
async (req, res) => {

    try {

        const result =
            await menuItemService.updateAvailability(

                req.user.restaurantId,

                req.params.id,

                req.body.is_available

            );

        res.json(result);

    } catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

};