const express =
    require("express");

const router =
    express.Router();

const authMiddleware =
    require("../middlewares/authMiddleware");

const alignAccountMiddleware =
    require("../middlewares/alignAccountMiddleware");

const ledgerPartyReportController =
    require("../controllers/ledgerPartyReportController");

router.use(
    authMiddleware
);

router.use(
    alignAccountMiddleware
);

router.get(
    "/",
    ledgerPartyReportController
        .getLinkedParties
);

router.get(
    "/:partyId",
    ledgerPartyReportController
        .getPartyReport
);

module.exports = router;
