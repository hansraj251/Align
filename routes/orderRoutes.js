
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const orderController = require("../controllers/orderController");
router.get(
    "/test",
    (req, res) => {

        res.json({
            success: true,
            message: "Order route working"
        });

    }
);
router.post(
    "/",
    authMiddleware,
    orderController.createOrder
);

router.get(
    "/history",
    authMiddleware,
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
    orderController.updateDiscount
);
router.patch(
    "/:orderId/send-to-billing",
    authMiddleware,
    orderController.sendToBilling
);

module.exports = router;