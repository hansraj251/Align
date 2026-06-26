const createRestaurantsTable = require("./schema/restaurants");

function initializeDatabase() {
    console.log("📦 Initializing database...");

    createRestaurantsTable();

    console.log("✅ Database initialization completed.");
}

module.exports = initializeDatabase;