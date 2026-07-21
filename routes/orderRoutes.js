
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware =
    require("../middlewares/adminMiddleware");
const orderController = require("../controllers/orderController");

router.post(
    "/",
    authMiddleware,
    orderController.createOrder
);

router.get(
    "/history",
    authMiddleware,
    adminMiddleware,
    orderController.getOrderHistory
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
router.patch(
    "/:id/discount",
    authMiddleware,
    adminMiddleware,
    orderController.updateDiscount
);
router.patch(
    "/:orderId/send-to-billing",
    authMiddleware,
    orderController.sendToBilling
);
router.patch(
    "/order-items/:id/serve",
    authMiddleware,
    adminMiddleware,
    orderController.serveOrderItem
);
router.delete(

    "/quick-item/:orderItemId",

    authMiddleware,

    adminMiddleware,

    orderController.removeQuickItem

);
module.exports = router;