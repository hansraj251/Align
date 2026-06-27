const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const orderStatusController = require("../controllers/orderStatusController");

router.patch(
    "/:id/status",
    authMiddleware,
    orderStatusController.updateStatus
);

module.exports = router;