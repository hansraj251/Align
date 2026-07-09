const express =
    require("express");

const router =
    express.Router();

const auth =
    require("../middlewares/authMiddleware");
const adminMiddleware =
    require("../middlewares/adminMiddleware");    

const controller =
    require("../controllers/systemCategoryController");

router.get(

    "/search",

    auth,
     adminMiddleware,

    controller.search

);

module.exports =
    router;