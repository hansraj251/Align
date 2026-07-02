const express =
    require("express");

const router =
    express.Router();

const auth =
    require("../middlewares/authMiddleware");

const controller =
    require("../controllers/orderItemController");

router.get(

    "/order/:orderId",

    auth,

    controller.getItems

);

router.patch(

    "/:id/status",

    auth,

    controller.updateStatus

);
router.get(
    "/kitchen",
    auth,
    controller.getKitchenItems
);

router.get(
    "/ready",
    auth,
    controller.getReadyItems
);

module.exports =
    router;