const express =
    require("express");

const router =
    express.Router();

const authMiddleware =
    require("../middlewares/authMiddleware");

const subscriptionRequestController =
    require("../controllers/subscriptionRequestController");
const superAdminMiddleware =
    require("../middlewares/superAdminMiddleware");    

router.post(
    "/request",
    authMiddleware,
    subscriptionRequestController
        .createUpgradeRequest
);
router.put(

    "/:id/approve",

    authMiddleware,

    superAdminMiddleware,

    subscriptionRequestController
        .approveRequest

);

module.exports =
    router;