const express = require("express");

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

module.exports = router;