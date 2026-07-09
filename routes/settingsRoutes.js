const express = require("express");

const router = express.Router();

const authMiddleware =
    require("../middlewares/authMiddleware");
const adminMiddleware =
    require("../middlewares/adminMiddleware");
const settingsController =
    require("../controllers/settingsController");

router.get(
    "/",
    authMiddleware,
    adminMiddleware,
    settingsController.getSettings
);

router.put(
    "/",
    authMiddleware,
    adminMiddleware,
    settingsController.saveSettings
);

module.exports = router;