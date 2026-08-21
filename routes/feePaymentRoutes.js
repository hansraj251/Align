const express =
    require("express");

const router =
    express.Router();

const feePaymentController =
    require("../controllers/feePaymentController");

const authMiddleware =
    require("../middlewares/authMiddleware");

router.get(
    "/student/:studentId",
    authMiddleware,
    feePaymentController.getPayments
);

router.get(
    "/student/:studentId/total",
    authMiddleware,
    feePaymentController.getTotalPaid
);

router.get(
    "/",
    authMiddleware,
    feePaymentController.getAllPayments
);


router.get(
    "/pending",
    authMiddleware,
    feePaymentController.getPendingFees
);


router.get(
    "/:id",
    authMiddleware,
    feePaymentController.getPayment
);

router.post(
    "/",
    authMiddleware,
    feePaymentController.createPayment
);

module.exports =
    router;