const express = require("express");

const router = express.Router();

const authMiddleware =
    require("../middlewares/authMiddleware");

const staffController =
    require("../controllers/staffController");

router.get(
    "/",
    authMiddleware,
    staffController.getStaff
);

router.post(
    "/",
    authMiddleware,
    staffController.createStaff
);

router.put(
    "/:id",
    authMiddleware,
    staffController.updateStaff
);

router.delete(
    "/:id",
    authMiddleware,
    staffController.deleteStaff
);

module.exports = router;