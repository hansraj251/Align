const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const orderController = require("../controllers/orderController");

router.post(
    "/",
    authMiddleware,
    orderController.createOrder
);

module.exports = router;