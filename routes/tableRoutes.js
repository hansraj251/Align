const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const tableController = require("../controllers/tableController");

router.post(
    "/",
    authMiddleware,
    tableController.createTable
);
router.get(
    "/",
    authMiddleware,
    tableController.getTables
);
module.exports = router;