const express = require("express");
const router = express.Router();

const authMiddleware =
    require("../middlewares/authMiddleware");
const adminMiddleware =
    require("../middlewares/adminMiddleware");    

const reportController =
    require("../controllers/reportController");

router.get(
    "/",
    authMiddleware,
     adminMiddleware,
    reportController.getReport
);
router.get(
    "/excel",
    authMiddleware,
     adminMiddleware,
    reportController.downloadExcel
);

router.get(
    "/pdf",
    authMiddleware,
     adminMiddleware,
    reportController.downloadPdf
);

module.exports = router;