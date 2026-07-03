const express =
    require("express");

const router =
    express.Router();

const auth =
    require("../middlewares/authMiddleware");

const controller =
    require("../controllers/systemCategoryController");

router.get(

    "/search",

    auth,

    controller.search

);

module.exports =
    router;