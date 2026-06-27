const createRestaurantsTable = require("./schema/restaurants");
const createUsersTable = require("./schema/users");
const createMenuCategoriesTable = require("./schema/menuCategories");
const createMenuItemsTable = require("./schema/menuItems");
function initializeDatabase() {
    console.log("📦 Initializing database...");

    createRestaurantsTable();
    createUsersTable();
    createMenuCategoriesTable();
    createMenuItemsTable();

    console.log("✅ Database initialization completed.");
}

module.exports = initializeDatabase;
