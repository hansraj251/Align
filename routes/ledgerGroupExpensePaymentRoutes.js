const express = require("express");

const ledgerGroupExpensePaymentController =
    require("../controllers/ledgerGroupExpensePaymentController");

const authMiddleware =
    require("../middlewares/authMiddleware");

const alignAccountMiddleware =
    require("../middlewares/alignAccountMiddleware");

const router = express.Router();

router.get(
    "/groups/:groupId/expenses/:expenseId",
    authMiddleware,
    alignAccountMiddleware,
    ledgerGroupExpensePaymentController.getPayments
);

router.put(
    "/groups/:groupId/expenses/:expenseId",
    authMiddleware,
    alignAccountMiddleware,
    ledgerGroupExpensePaymentController.setPayments
);

module.exports = router;
