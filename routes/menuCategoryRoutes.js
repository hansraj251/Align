const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const menuCategoryController = require("../controllers/menuCategoryController");

router.post(
    "/",
    authMiddleware,
    menuCategoryController.createCategory
);


router.get(
    "/",
    authMiddleware,
    menuCategoryController.getCategories
);
router.put(
    "/:id",
    authMiddleware,
    menuCategoryController.updateCategory
);
router.delete(
    "/:id",
    authMiddleware,
    menuCategoryController.deleteCategory
);

module.exports = router;