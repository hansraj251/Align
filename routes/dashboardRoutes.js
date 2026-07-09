const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware =
    require("../middlewares/adminMiddleware");
const dashboardController = require("../controllers/dashboardController");

router.get(
    "/",
    authMiddleware,
    adminMiddleware,
    dashboardController.getDashboard
);

module.exports = router;