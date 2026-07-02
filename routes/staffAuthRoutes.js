const express =
    require("express");

const router =
    express.Router();

const controller =
    require("../controllers/staffAuthController");

router.post(
    "/login",
    controller.login
);

module.exports =
    router;