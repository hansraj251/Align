const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const orderController = require("../controllers/orderController");

router.post(
    "/",
    authMiddleware,
    orderController.createOrder
);
router.get(
    "/table/:tableId",
    authMiddleware,
    orderController.getActiveOrder
);
router.get(
    "/:orderId",
    authMiddleware,
    orderController.getOrder
);
module.exports = router;