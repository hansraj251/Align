const express = require("express");

const router = express.Router();

const authMiddleware =
    require("../middlewares/authMiddleware");
const adminMiddleware =
    require("../middlewares/adminMiddleware");    

const staffController =
    require("../controllers/staffController");

router.get(
    "/",
    authMiddleware,
    adminMiddleware,
    staffController.getStaff
);

router.post(
    "/",
    authMiddleware,
    adminMiddleware,
    staffController.createStaff
);

router.put(
    "/:id",
    authMiddleware,
    adminMiddleware,
    staffController.updateStaff
);

router.delete(
    "/:id",
    authMiddleware,
    adminMiddleware,
    staffController.deleteStaff
);

module.exports = router;