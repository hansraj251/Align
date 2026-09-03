const express = require("express");

const router = express.Router();

const musicController =
    require("../controllers/musicController");

router.get(
    "/search",
    musicController.search
);

module.exports = router;
