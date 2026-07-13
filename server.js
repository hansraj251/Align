require("dotenv").config();
const http = require("http");

require("./db");
const path = require("path");
const initializeDatabase = require("./database/init");
console.log("initializeDatabase =", initializeDatabase);
console.log("type =", typeof initializeDatabase);
const express = require("express");
const socket = require("./utils/socket");

const cors = require("cors");

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);
const staffAuthRoutes =
    require("./routes/staffAuthRoutes");
const restaurantRoutes = require("./routes/restaurantRoutes");
const menuCategoryRoutes = require("./routes/menuCategoryRoutes");
const menuItemRoutes = require("./routes/menuItemRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const tableRoutes = require("./routes/tableRoutes");
const orderRoutes = require("./routes/orderRoutes");
const checkoutRoutes =
    require("./routes/checkoutRoutes");
const kitchenRoutes = require("./routes/kitchenRoutes");
const orderStatusRoutes =
    require("./routes/orderStatusRoutes");    
const billingRoutes =
    require("./routes/billingRoutes");    
const paymentRoutes =
    require("./routes/paymentRoutes");    
const receiptRoutes =
    require("./routes/receiptRoutes");   
const settingsRoutes =
    require("./routes/settingsRoutes");   
const diningAreaRoutes =
    require("./routes/diningAreaRoutes");     
const staffRoutes =
    require("./routes/staffRoutes");   
const menuVariantRoutes =
    require("./routes/menuVariantRoutes");    
const orderItemRoutes =
    require("./routes/orderItemRoutes");   
const reportRoutes =
    require("./routes/reportRoutes");  
const superAdminRoutes =
    require("./routes/superAdminRoutes");  
const subscriptionRoutes =
    require("./routes/subscriptionRoutes");    
const subscriptionRequestRoutes =
    require("./routes/subscriptionRequestRoutes");           
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
app.use("/api/kitchen", kitchenRoutes);
app.use(express.static("public"));
app.use(
    "/uploads",
    express.static(
        path.join(__dirname, "uploads")
    )
);
app.use(

    "/api/staff-auth",

    staffAuthRoutes
);
app.use("/api/orders", orderStatusRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/payment", paymentRoutes);
app.use(
    "/api/receipt",
    receiptRoutes
);
app.use(
    "/api/settings",
    settingsRoutes
);
app.use(
    "/api/dining-areas",
    diningAreaRoutes
);
app.use(
    "/api/staff",
    staffRoutes
);
app.use(
    "/api/system/categories",
    require("./routes/systemCategoryRoutes")
);
app.use(
    "/api/category-search",
    require("./routes/categorySearchRoutes")
);
app.use(
"/api/system-menu-search",
require("./routes/systemMenuItemRoutes")
);
app.use(

    "/api/menu/items",

    menuVariantRoutes

);
app.use(

    "/api/order-items",

    orderItemRoutes

);
app.use(

    "/api/reports",

    reportRoutes

);
app.use(
    "/api/super-admin",
    superAdminRoutes
);
app.use(
    "/api/subscription",
    subscriptionRoutes
);
app.use(
    "/api/subscription",
    subscriptionRequestRoutes
);
app.get("/", (req, res) => {
    res.redirect("/admin/login.html");
});

initializeDatabase()
    .catch(console.error);

const PORT = process.env.PORT || 3000;

console.log("🚀 SOCKET VERSION: 2026-07-10-V3");

socket.init(server);

server.listen(PORT, () => {
    console.log(`🚀 Align Server running on http://localhost:${PORT}`);
});