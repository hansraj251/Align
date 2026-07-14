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

router.get(
    "/plans",
    auth,
    subscriptionController.getPlans
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

router.post(
    "/webhook",
    subscriptionController.webhook
);

module.exports =
    router;