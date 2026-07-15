const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");

const tableController = require("../controllers/tableController");

router.get(
    "/takeaway",
    authMiddleware,
    tableController.getTakeAwayTable
);

router.post(
    "/",
    authMiddleware,
    adminMiddleware,
    tableController.createTable
);

router.get(
    "/",
    authMiddleware,
    tableController.getTables
);

router.get(
    "/:id",
    authMiddleware,
    tableController.getTable
);

router.delete(
    "/:id",
    authMiddleware,
    adminMiddleware,
    tableController.deleteTable
);

router.put(
    "/:id",
    authMiddleware,
    adminMiddleware,
    tableController.updateTable
);



module.exports = router;