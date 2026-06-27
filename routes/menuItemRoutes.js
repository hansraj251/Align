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

module.exports = router;