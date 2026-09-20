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

const ledgerProfilePhotoUploadMiddleware =

    require("../middlewares/ledgerProfilePhotoUploadMiddleware");

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

router.post(

    "/photo",

    ledgerProfilePhotoUploadMiddleware,

    ledgerProfileController.uploadProfilePhoto
);

module.exports =
    router;
