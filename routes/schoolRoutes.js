const express =
    require("express");

const router =
    express.Router();

const schoolController =
    require("../controllers/schoolController");

const authMiddleware =
    require("../middlewares/authMiddleware");

router.get(
    "/me",
    authMiddleware,
    schoolController.getSchool
);
router.put(
    "/me",
    authMiddleware,
    schoolController.updateSchoolProfile
);

module.exports =
    router;
