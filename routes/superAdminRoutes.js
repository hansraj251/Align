const express = require("express");

const router = express.Router();

const superAdminController =
    require("../controllers/superAdminController");
const planController =
    require("../controllers/planController");    

router.post(
    "/login",
    superAdminController.login
);

router.get(
    "/dashboard",
    superAdminController.dashboard
);
router.get(
    "/restaurants",
    superAdminController.getRestaurants
);
router.get(
    "/restaurants/:restaurantId",
    superAdminController.getRestaurant
);

router.put(
    "/restaurants/:restaurantId/subscription",
    superAdminController.updateRestaurantSubscription
);
router.get(
    "/restaurants/:restaurantId/active-sessions",
    superAdminController.getActiveSessions
);
router.post(
    "/sessions/:sessionId/force-logout",
    superAdminController.forceLogout
);

router.get(
    "/plans",
    planController.getPlans
);
router.get(
    "/plans/:id",
    planController.getPlan
);

router.put(
    "/plans/:id",
    planController.updatePlan
);

module.exports = router;