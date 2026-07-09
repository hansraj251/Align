const express = require("express");

const router = express.Router();

const authMiddleware =
    require("../middlewares/authMiddleware");
const adminMiddleware =
    require("../middlewares/adminMiddleware");    

const receiptController =
    require("../controllers/receiptController");

router.get(
    "/:id",
    authMiddleware,
    adminMiddleware,
    receiptController.getReceipt
);

module.exports = router;