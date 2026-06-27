const createRestaurantsTable = require("./schema/restaurants");
const createUsersTable = require("./schema/users");
const createMenuCategoriesTable = require("./schema/menuCategories");
function initializeDatabase() {
    console.log("📦 Initializing database...");

    createRestaurantsTable();
    createUsersTable();
    createMenuCategoriesTable();

    console.log("✅ Database initialization completed.");
}

module.exports = initializeDatabase;
