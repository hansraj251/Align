const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const billingMiddleware =
    require("../middlewares/billingMiddleware");
const billingController = require("../controllers/billingController");

router.get(
    "/",
    authMiddleware,
    billingMiddleware,
    billingController.getReadyOrders
);

router.post(
    "/pay",
    authMiddleware,
    billingMiddleware,
    billingController.payOrder
);

module.exports = router;