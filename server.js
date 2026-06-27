require("dotenv").config();
require("./db");

const initializeDatabase = require("./database/init");
console.log("initializeDatabase =", initializeDatabase);
console.log("type =", typeof initializeDatabase);
const express = require("express");

const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);
const restaurantRoutes = require("./routes/restaurantRoutes");
const menuCategoryRoutes = require("./routes/menuCategoryRoutes");
const menuItemRoutes = require("./routes/menuItemRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const tableRoutes = require("./routes/tableRoutes");
const orderRoutes = require("./routes/orderRoutes");
const checkoutRoutes =
    require("./routes/checkoutRoutes");
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/menu/categories", menuCategoryRoutes);
app.use("/api/menu/items", menuItemRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/tables", tableRoutes);
app.use(
    "/api/orders/checkout",
    checkoutRoutes
);
app.use("/api/orders", orderRoutes);
app.use(express.static("public"));
app.get("/", (req, res) => {

  res.json({

    success: true,

    message: "Welcome to Align API",

    version: "1.0.0"

  });

});

initializeDatabase();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

  console.log(`🚀 Align Server running on http://localhost:${PORT}`);

});