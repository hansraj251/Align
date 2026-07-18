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
router.get(
    "/active-devices",
    auth,
    subscriptionController.getActiveDevices
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

router.post(
    "/active-devices/:sessionId/logout",
    auth,
    subscriptionController.logoutActiveDevice
);


module.exports =
    router;