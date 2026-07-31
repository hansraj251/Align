const express =
    require("express");

const router =
    express.Router();

const posAuthController =
    require("../controllers/posAuthController");

router.post(
    "/login",
    posAuthController.login
);

module.exports =
    router;