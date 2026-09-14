const express =
    require("express");

const router =
    express.Router();

const authMiddleware =
    require("../middlewares/authMiddleware");

const alignAccountMiddleware =
    require("../middlewares/alignAccountMiddleware");

const controller =
    require("../controllers/ledgerInterestReceivedController");

router.use(
    authMiddleware,
    alignAccountMiddleware
);

router.get(
    "/party/:partyId",
    controller.getInterestReceived
);

router.post(
    "/party/:partyId",
    controller.createInterestReceived
);

router.put(
    "/party/:partyId/:interestId",
    controller.updateInterestReceived
);

router.delete(
    "/party/:partyId/:interestId",
    controller.deleteInterestReceived
);

module.exports = router;
