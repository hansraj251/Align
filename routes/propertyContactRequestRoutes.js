const express =
    require("express");

const router =
    express.Router();

const propertyContactRequestController =
    require("../controllers/propertyContactRequestController");

const propertyAuthMiddleware =
    require("../middlewares/propertyAuthMiddleware");


// Buyer — no login required
router.post(
    "/:id",
    propertyContactRequestController.create
);
// Buyer — view shared seller contact details

router.get(
    "/:id/contact",
    propertyContactRequestController.getSharedContact
);

// Seller — view own contact requests
router.get(
    "/mine",
    propertyAuthMiddleware,
    propertyContactRequestController.getMine
);


// Seller — update request status
router.patch(
    "/:id/status",
    propertyAuthMiddleware,
    propertyContactRequestController.updateStatus
);
// Seller — share contact details with buyer

router.patch(
    "/:id/share",
    propertyAuthMiddleware,
    propertyContactRequestController.shareContact
);

module.exports =
    router;
