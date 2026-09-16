const express = require("express");

const ledgerGroupSummaryController =
    require("../controllers/ledgerGroupSummaryController");

const authMiddleware =
    require("../middlewares/authMiddleware");

const alignAccountMiddleware =
    require("../middlewares/alignAccountMiddleware");

const router = express.Router();

router.get(
    "/groups/:groupId",
    authMiddleware,
    alignAccountMiddleware,
    ledgerGroupSummaryController.getSummary
);

module.exports = router;
