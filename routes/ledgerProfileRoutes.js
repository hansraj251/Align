const express =
    require("express");

const router =
    express.Router();

const authMiddleware =
    require("../middlewares/authMiddleware");

const alignAccountMiddleware =
    require("../middlewares/alignAccountMiddleware");

const ledgerProfileController =
    require("../controllers/ledgerProfileController");

router.use(
    authMiddleware,
    alignAccountMiddleware
);

router.get(
    "/",
    ledgerProfileController.getProfile
);

router.put(
    "/",
    ledgerProfileController.updateProfile
);

module.exports =
    router;
