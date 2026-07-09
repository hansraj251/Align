const express = require("express");

const router = express.Router();

const authMiddleware =
    require("../middlewares/authMiddleware");
const adminMiddleware =
    require("../middlewares/adminMiddleware");    

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
    adminMiddleware,
    diningAreaController.create
);

router.put(
    "/:id",
    authMiddleware,
    adminMiddleware,
    diningAreaController.update
);

router.delete(
    "/:id",
    authMiddleware,
    adminMiddleware,
    diningAreaController.remove
);

module.exports = router;