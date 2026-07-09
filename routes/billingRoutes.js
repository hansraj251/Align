const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware =
    require("../middlewares/adminMiddleware");
const billingController = require("../controllers/billingController");

router.get(
    "/",
    authMiddleware,
    adminMiddleware,
    billingController.getReadyOrders
);

module.exports = router;