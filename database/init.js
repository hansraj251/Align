const createRestaurantsTable = require("./schema/restaurants");
const createUsersTable = require("./schema/users");
const createTablesTable =

    require("./tables/createTablesTable");
const createMenuCategoriesTable = require("./schema/menuCategories");
const createMenuItemsTable = require("./schema/menuItems");
const createOrdersTable =
    require("./orders/createOrdersTable");

const createOrderItemsTable =
    require("./orders/createOrderItemsTable");
function initializeDatabase() {
    console.log("📦 Initializing database...");

    createRestaurantsTable();
    createUsersTable();
    createMenuCategoriesTable();
    createMenuItemsTable();
    createTablesTable();
    createOrdersTable();
    createOrderItemsTable();

    console.log("✅ Database initialization completed.");
}

module.exports = initializeDatabase;
