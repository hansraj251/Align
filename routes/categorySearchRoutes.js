const express =
    require("express");

const router =
    express.Router();

const auth =
    require("../middlewares/authMiddleware");

const controller =
    require("../controllers/categorySearchController");

router.get(

    "/",

    auth,

    controller.search

);

module.exports =
    router;