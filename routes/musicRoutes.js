const express = require("express");

const router = express.Router();

const musicController =

    require("../controllers/musicController");

router.get(

    "/search",

    musicController.search

);

router.post(

    "/save",

    musicController.save

);

router.get(

    "/discover",

    musicController.discover

);

module.exports = router;