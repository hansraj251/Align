const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const paymentController = require("../controllers/paymentController");

router.patch(
    "/:id",
    authMiddleware,
    paymentController.receivePayment
);

module.exports = router;