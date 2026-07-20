const express = require("express");

const router = express.Router();

const authMiddleware =
    require("../middlewares/authMiddleware");
const billingMiddleware =
    require("../middlewares/billingMiddleware");  

const receiptController =
    require("../controllers/receiptController");

router.get(
    "/:id",
    authMiddleware,
    billingMiddleware,
    receiptController.getReceipt
);

module.exports = router;