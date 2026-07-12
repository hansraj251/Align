const express = require("express");

const router = express.Router();

const superAdminController =
    require("../controllers/superAdminController");

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
module.exports = router;