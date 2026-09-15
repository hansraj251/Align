const express =

    require("express");

const router =

    express.Router();

const ledgerGroupController =

    require("../controllers/ledgerGroupController");

const authMiddleware =

    require("../middlewares/authMiddleware");

const alignAccountMiddleware =

    require("../middlewares/alignAccountMiddleware");


// Get all groups

router.get(

    "/",

    authMiddleware,

    alignAccountMiddleware,

    ledgerGroupController.getGroups

);


// Get single group

router.get(

    "/:id",

    authMiddleware,

    alignAccountMiddleware,

    ledgerGroupController.getGroup

);


// Create group

router.post(

    "/",

    authMiddleware,

    alignAccountMiddleware,

    ledgerGroupController.createGroup

);


// Update group

router.put(

    "/:id",

    authMiddleware,

    alignAccountMiddleware,

    ledgerGroupController.updateGroup

);


// Deactivate group

router.delete(

    "/:id",

    authMiddleware,

    alignAccountMiddleware,

    ledgerGroupController.deleteGroup

);


module.exports =

    router;
