const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const kitchenController = require("../controllers/kitchenController");

router.get(
    "/",
    authMiddleware,
    kitchenController.getKitchenOrders
);
router.patch(
    "/:ticketId/status",
    authMiddleware,
    kitchenController.updateTicketStatus
);
router.patch(
    "/items/:itemId/status",
    authMiddleware,
    kitchenController.updateTicketItemStatus
);
router.patch(
    "/items/:itemId/cancel",
    authMiddleware,
    kitchenController.cancelTicketItem
);
router.patch(
    "/:ticketId/close-cancelled",
    authMiddleware,
    kitchenController.closeCancelledTicket
);
module.exports = router;