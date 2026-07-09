const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware =
    require("../middlewares/adminMiddleware");
const menuCategoryController = require("../controllers/menuCategoryController");

router.post(
    "/",
    authMiddleware,
    adminMiddleware,
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
    adminMiddleware,
    menuCategoryController.updateCategory
);
router.delete(
    "/:id",
    authMiddleware,
    adminMiddleware,
    menuCategoryController.deleteCategory
);

module.exports = router;