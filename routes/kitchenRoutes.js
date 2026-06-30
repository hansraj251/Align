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
module.exports = router;