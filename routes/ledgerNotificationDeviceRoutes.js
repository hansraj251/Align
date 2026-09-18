const express =

    require("express");

const router =

    express.Router();

const authMiddleware =

    require("../middlewares/authMiddleware");

const alignAccountMiddleware =

    require("../middlewares/alignAccountMiddleware");

const ledgerNotificationDeviceController =

    require("../controllers/ledgerNotificationDeviceController");

router.use(

    authMiddleware,

    alignAccountMiddleware

);

router.post(

    "/",

    ledgerNotificationDeviceController.registerDevice

);

router.get(

    "/",

    ledgerNotificationDeviceController.getDevices

);

router.delete(

    "/",

    ledgerNotificationDeviceController.unregisterDevice

);

router.delete(

    "/all",

    ledgerNotificationDeviceController.unregisterAllDevices

);

module.exports =

    router;
