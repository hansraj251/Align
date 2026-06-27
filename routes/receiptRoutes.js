const express = require("express");

const router = express.Router();

const authMiddleware =
    require("../middlewares/authMiddleware");

const receiptController =
    require("../controllers/receiptController");

router.get(
    "/:id",
    authMiddleware,
    receiptController.getReceipt
);

module.exports = router;