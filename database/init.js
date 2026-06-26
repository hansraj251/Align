const createRestaurantsTable = require("./schema/restaurants");
const createUsersTable = require("./schema/users");

function initializeDatabase() {
    console.log("📦 Initializing database...");

    createRestaurantsTable();
    createUsersTable();

    console.log("✅ Database initialization completed.");
}

module.exports = initializeDatabase;