const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const menuItemController = require("../controllers/menuItemController");

router.post(
    "/",
    authMiddleware,
    menuItemController.createMenuItem
);

router.get(
    "/",
    authMiddleware,
    menuItemController.getMenuItems
);
router.put(
    "/:id",
    authMiddleware,
    menuItemController.updateMenuItem
);

router.delete(
    "/:id",
    authMiddleware,
    menuItemController.deleteMenuItem
);

module.exports = router;