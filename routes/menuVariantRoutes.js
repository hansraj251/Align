const express =
    require("express");

const router =
    express.Router();

const authMiddleware =
    require("../middlewares/authMiddleware");

const controller =
    require("../controllers/menuVariantController");

router.get(

    "/:id/variants",

    authMiddleware,

    controller.getVariants

);
router.put(

    "/:id/variants",

    authMiddleware,

    controller.replaceVariants

);
module.exports =
    router;