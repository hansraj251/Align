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
const createStaffTable =

    require("./schema/staff");
const createSuperAdminTable =
    require("./schema/superAdmin");     
const seedSuperAdmin =
    require("./seed/superAdminSeed");    
const createPlansTable =
    require("./schema/plans");       
const seedPlans =
    require("./seed/planSeed");  
const createPlanPricingTable =
    require("./schema/planPricing");      
const createPlanLimitsTable =
    require("./schema/planLimits");

const seedPlanLimits =
    require("./seed/planLimitSeed");   
const createSubscriptionRequestsTable =
    require("./schema/subscriptionRequests"); 
async function initializeDatabase() {
    console.log("📦 Initializing database...");

    await createRestaurantsTable();

await createUsersTable();

await createDiningAreasTable();

await createTablesTable();

await createMenuCategoriesTable();

await createMenuItemsTable();

await createStaffTable();

await createPlansTable();

createSubscriptionRequestsTable();

await createPlanPricingTable();

await createPlanLimitsTable();

await createSuperAdminTable();

await createOrdersTable();

await createOrderItemsTable();

await createKitchenTables();

await runMigrations();

await seedPlans();

await seedPlanLimits();

await seedSuperAdmin();


    console.log("✅ Database initialization completed.");
}

module.exports = initializeDatabase;
