const express = require("express");

const ledgerGroupExpenseController =
    require("../controllers/ledgerGroupExpenseController");

const authMiddleware =
    require("../middlewares/authMiddleware");

const alignAccountMiddleware =
    require("../middlewares/alignAccountMiddleware");

const router = express.Router();

router.get(
    "/groups/:groupId",
    authMiddleware,
    alignAccountMiddleware,
    ledgerGroupExpenseController.getExpenses
);

router.get(
    "/groups/:groupId/:id",
    authMiddleware,
    alignAccountMiddleware,
    ledgerGroupExpenseController.getExpense
);

router.post(
    "/groups/:groupId",
    authMiddleware,
    alignAccountMiddleware,
    ledgerGroupExpenseController.createExpense
);

router.put(
    "/groups/:groupId/:id",
    authMiddleware,
    alignAccountMiddleware,
    ledgerGroupExpenseController.updateExpense
);

router.delete(
    "/groups/:groupId/:id",
    authMiddleware,
    alignAccountMiddleware,
    ledgerGroupExpenseController.deleteExpense
);

module.exports = router;
