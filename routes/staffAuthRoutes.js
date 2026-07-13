const express =
    require("express");

const router =
    express.Router();

const controller =
    require("../controllers/staffAuthController");
const authMiddleware =
    require("../middlewares/authMiddleware");
    

router.post(
    "/login",
    controller.login
);

router.post(
    "/logout",
    authMiddleware,
    controller.logout
);

module.exports =
    router;