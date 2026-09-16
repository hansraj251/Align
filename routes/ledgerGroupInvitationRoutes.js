const express =

    require("express");

const router =

    express.Router();

const ledgerGroupInvitationController =

    require("../controllers/ledgerGroupInvitationController");

const authMiddleware =

    require("../middlewares/authMiddleware");

const alignAccountMiddleware =

    require("../middlewares/alignAccountMiddleware");


// Get pending invitations

router.get(

    "/",

    authMiddleware,

    alignAccountMiddleware,

    ledgerGroupInvitationController.getPendingInvitations

);


// Create group invitation

router.post(

    "/groups/:id",

    authMiddleware,

    alignAccountMiddleware,

    ledgerGroupInvitationController.createInvitation

);


// Accept or reject invitation

router.put(

    "/:id/respond",

    authMiddleware,

    alignAccountMiddleware,

    ledgerGroupInvitationController.respondToInvitation

);


module.exports =

    router;
