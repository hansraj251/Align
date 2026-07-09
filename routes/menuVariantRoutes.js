const express =
    require("express");

const router =
    express.Router();

const authMiddleware =
    require("../middlewares/authMiddleware");
const adminMiddleware =
    require("../middlewares/adminMiddleware");
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

    adminMiddleware,

    controller.replaceVariants

);
module.exports =
    router;