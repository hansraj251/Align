const createRestaurantsTable =
    require("./schema/restaurants");

const createUsersTable =
    require("./schema/users");

const createEmailOtpsTable =
    require("./schema/emailOtps");

const createPlansTable =
    require("./schema/plans");

const createPlanPricingTable =
    require("./schema/planPricing");

const createPlanLimitsTable =
    require("./schema/planLimits");

const createSubscriptionOrdersTable =
    require("./schema/subscriptionOrders");

const createSubscriptionRequestsTable =
    require("./schema/subscriptionRequests");

const createSuperAdminTable =
    require("./schema/superAdmin");
const createAppVersionTable =
require("./schema/appVersion");    

const seedPlans =
    require("./seed/planSeed");

const seedPlanLimits =
    require("./seed/planLimitSeed");

const seedSuperAdmin =
    require("./seed/superAdminSeed");
    

async function initializeDatabase() {

    await createRestaurantsTable();

    await createUsersTable();

    await createEmailOtpsTable();

    await createPlansTable();

    await createPlanPricingTable();

    await createPlanLimitsTable();

    await createSubscriptionOrdersTable();

    await createSubscriptionRequestsTable();

    await createSuperAdminTable();

    await createAppVersionTable();

    await seedPlans();

    await seedPlanLimits();

    await seedSuperAdmin();

}

module.exports =
    initializeDatabase;