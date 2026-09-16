const express = require("express");

const ledgerGroupExpenseSplitController =
    require("../controllers/ledgerGroupExpenseSplitController");

const authMiddleware =
    require("../middlewares/authMiddleware");

const alignAccountMiddleware =
    require("../middlewares/alignAccountMiddleware");

const router = express.Router();

router.get(
    "/groups/:groupId/expenses/:expenseId",
    authMiddleware,
    alignAccountMiddleware,
    ledgerGroupExpenseSplitController.getSplits
);

router.put(
    "/groups/:groupId/expenses/:expenseId",
    authMiddleware,
    alignAccountMiddleware,
    ledgerGroupExpenseSplitController.setSplits
);

module.exports = router;
