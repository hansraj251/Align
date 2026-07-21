const express = require("express");

const router = express.Router();

const authMiddleware =
    require("../middlewares/authMiddleware");

const adminMiddleware =
    require("../middlewares/adminMiddleware");

const quickItemController =
    require("../controllers/quickItemController");

router.post(
    "/",
    authMiddleware,
    adminMiddleware,
    quickItemController.create
);

router.get(
    "/",
    authMiddleware,
    quickItemController.getAll
);

router.get(
    "/:id",
    authMiddleware,
    quickItemController.getById
);

router.put(
    "/:id",
    authMiddleware,
    adminMiddleware,
    quickItemController.update
);

router.delete(
    "/:id",
    authMiddleware,
    adminMiddleware,
    quickItemController.delete
);
router.patch(

    "/:id/active",

    authMiddleware,

    adminMiddleware,

    quickItemController.updateActive

);

module.exports = router;