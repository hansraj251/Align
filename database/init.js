const createDiningAreasTable =
    require("./schema/diningAreas");
const createRestaurantsTable = require("./schema/restaurants");
const createUsersTable = require("./schema/users");
const createTablesTable =

    require("./tables/createTablesTable");
const {
    createKitchenTables
} = require("./schema/kitchenTickets");    
const createMenuCategoriesTable = require("./schema/menuCategories");
const createMenuItemsTable = require("./schema/menuItems");
const createOrdersTable =
    require("./orders/createOrdersTable");

const createOrderItemsTable =
    require("./orders/createOrderItemsTable");
const runMigrations =
    require("../migrations");    
async function initializeDatabase() {
    console.log("📦 Initializing database...");

    await createRestaurantsTable();

await createUsersTable();

await createDiningAreasTable();

await createTablesTable();

await createMenuCategoriesTable();

await createMenuItemsTable();

await createOrdersTable();

await createOrderItemsTable();

await createKitchenTables();

await runMigrations();

    console.log("✅ Database initialization completed.");
}

module.exports = initializeDatabase;
