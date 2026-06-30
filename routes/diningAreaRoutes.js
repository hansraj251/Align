const express = require("express");

const router = express.Router();

const authMiddleware =
    require("../middlewares/authMiddleware");

const diningAreaController =
    require("../controllers/diningAreaController");

router.get(
    "/",
    authMiddleware,
    diningAreaController.getAll
);

router.post(
    "/",
    authMiddleware,
    diningAreaController.create
);

router.put(
    "/:id",
    authMiddleware,
    diningAreaController.update
);

router.delete(
    "/:id",
    authMiddleware,
    diningAreaController.remove
);

module.exports = router;