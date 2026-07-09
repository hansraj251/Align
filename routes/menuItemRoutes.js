const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");
const menuItemController = require("../controllers/menuItemController");

router.post(
    "/",
    authMiddleware,
    adminMiddleware,
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
    adminMiddleware,
    menuItemController.deleteMenuItem
);
router.patch(
    "/:id/availability",
    authMiddleware,
    adminMiddleware,
    menuItemController.updateAvailability
);
router.get(
    "/all",
    authMiddleware,
    menuItemController.getAllMenuItems
);
module.exports = router;