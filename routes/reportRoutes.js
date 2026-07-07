const express = require("express");
const router = express.Router();

const authMiddleware =
    require("../middlewares/authMiddleware");

const reportController =
    require("../controllers/reportController");

router.get(
    "/",
    authMiddleware,
    reportController.getReport
);
router.get(
    "/excel",
    authMiddleware,
    reportController.downloadExcel
);

module.exports = router;