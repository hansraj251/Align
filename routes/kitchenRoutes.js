const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware =
    require("../middlewares/adminMiddleware");
const kitchenController = require("../controllers/kitchenController");

router.get(
    "/",
    authMiddleware,
    adminMiddleware,
    kitchenController.getKitchenOrders
);
router.patch(
    "/:ticketId/status",
    authMiddleware,
    adminMiddleware,
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
    "/admin/items/:itemId/cancel",
    authMiddleware,
    adminMiddleware,
    kitchenController.adminCancelTicketItem
);
router.patch(
    "/:ticketId/close-cancelled",
    authMiddleware,
    adminMiddleware,
    kitchenController.closeCancelledTicket
);
module.exports = router;