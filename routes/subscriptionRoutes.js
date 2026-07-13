const express =
    require("express");

const router =
    express.Router();

const auth =
    require("../middlewares/authMiddleware");

const subscriptionController =
    require("../controllers/subscriptionController");

router.get(
    "/",
    auth,
    subscriptionController.getSubscription
);

router.post(
    "/create-order",
    auth,
    subscriptionController.createOrder
);
router.post(
    "/verify-payment",
    auth,
    subscriptionController.verifyPayment
);

module.exports =
    router;