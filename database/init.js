const createRestaurantsTable = require("./schema/restaurants");
const createUsersTable = require("./schema/users");
const createTablesTable =

    require("./tables/createTablesTable");
const createMenuCategoriesTable = require("./schema/menuCategories");
const createMenuItemsTable = require("./schema/menuItems");
function initializeDatabase() {
    console.log("📦 Initializing database...");

    createRestaurantsTable();
    createUsersTable();
    createMenuCategoriesTable();
    createMenuItemsTable();
    createTablesTable();

    console.log("✅ Database initialization completed.");
}

module.exports = initializeDatabase;
