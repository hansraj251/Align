const express = require("express");

const ledgerGroupSettlementController =
    require("../controllers/ledgerGroupSettlementController");

const authMiddleware =
    require("../middlewares/authMiddleware");

const alignAccountMiddleware =
    require("../middlewares/alignAccountMiddleware");

const router = express.Router();

router.get(
    "/groups/:groupId",
    authMiddleware,
    alignAccountMiddleware,
    ledgerGroupSettlementController.getSettlements
);

router.get(
    "/groups/:groupId/:id",
    authMiddleware,
    alignAccountMiddleware,
    ledgerGroupSettlementController.getSettlement
);

router.post(
    "/groups/:groupId",
    authMiddleware,
    alignAccountMiddleware,
    ledgerGroupSettlementController.createSettlement
);

router.delete(
    "/groups/:groupId/:id",
    authMiddleware,
    alignAccountMiddleware,
    ledgerGroupSettlementController.deleteSettlement
);

module.exports = router;
