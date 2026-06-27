const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const billingController = require("../controllers/billingController");

router.get(
    "/",
    authMiddleware,
    billingController.getReadyOrders
);

module.exports = router;