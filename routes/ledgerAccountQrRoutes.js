const express =

    require("express");

const router =

    express.Router();

const authMiddleware =

    require("../middlewares/authMiddleware");

const alignAccountMiddleware =

    require("../middlewares/alignAccountMiddleware");

const ledgerAccountQrController =

    require("../controllers/ledgerAccountQrController");

router.use(

    authMiddleware,

    alignAccountMiddleware

);

router.get(

    "/",

    ledgerAccountQrController.getQrToken

);

router.post(

    "/resolve",

    ledgerAccountQrController.resolveQrToken

);

module.exports =

    router;
