const menuCategoryService = require("../services/menuCategoryService");

exports.createCategory = async (req, res) => {

    try {

        const { name, description } = req.body;

        const restaurantId =
            req.user.restaurantId;

        if (!name || name.trim() === "") {

            return res.status(400).json({
                success: false,
                message: "Category name is required"
            });

        }

        const result =
            await menuCategoryService.createCategory(
                restaurantId,
                name,
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
exports.getCategories = async (req, res) => {

    try {

        const restaurantId = req.user.restaurantId;

        const categories =
            await menuCategoryService.getCategories(
                restaurantId
            );

        return res.json({
            success: true,
            categories
        });

    } catch (err) {

        return res.status(500).json({
            success: false,
            message: err.message
        });

    }

};
exports.deleteCategory = async (req, res) => {

    try {

        const result =
            await menuCategoryService.deleteCategory(
                req.user.restaurantId,
                req.params.id
            );

        return res.json(result);

    } catch (err) {

        return res.status(500).json({
            success: false,
            message: err.message
        });

    }

};
exports.updateCategory = async (req, res) => {

    try {

        const { name, description } = req.body;

        if (!name || name.trim() === "") {

            return res.status(400).json({
                success: false,
                message: "Category name is required"
            });

        }

        const result =
            await menuCategoryService.updateCategory(
                req.user.restaurantId,
                req.params.id,
                name,
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