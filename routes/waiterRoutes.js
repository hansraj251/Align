const express =
    require("express");

const router =
    express.Router();

const auth =
    require("../middlewares/authMiddleware");
const waiter =
    require("../middlewares/waiterMiddleware");    

const waiterController =
    require("../controllers/waiterController");

router.get(
    "/ready-items",
    auth,
    waiter,
    waiterController.getReadyItems
);
router.patch(
    "/serve/:ticketId",
    auth,
    waiter,
    waiterController.serveTicket
);
router.patch(
    "/serve/item/:itemId",
    auth,
    waiter,
    waiterController.serveItem
);

module.exports =
    router;