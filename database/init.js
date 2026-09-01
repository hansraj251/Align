const createRestaurantsTable =
    require("./schema/restaurants");

const createUsersTable =
    require("./schema/users");

const createSchoolsTable =
    require("./schema/schools");
const createStudentsTable =
    require("./schema/students");
const createFeeStructuresTable =
    require("./schema/feeStructures");
const createFeePaymentsTable =
    require("./schema/feePayments");
const createAttendanceTable =
    require("./schema/attendance");
const createHolidaysTable =
    require("./schema/holidays");
const createTeachersTable =
    require("./schema/teachers");
const createDesignationsTable =
    require("./schema/designations");
const createAttendanceUserClassesTable =
    require("./schema/attendanceUserClasses");
const createSalaryStructuresTable =
    require("./schema/salaryStructures");
const createClassesTable =
    require("./schema/classes");
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

const createPropertyUsersTable =
    require("./schema/propertyUsers");

const createPropertyListingsTable =
    require("./schema/propertyListings");

const createPropertyListingImagesTable =
    require("./schema/propertyListingImages");
const createPropertyListingSavesTable =
    require("./schema/propertyListingSaves");
const createPropertyContactRequestsTable =
    require("./schema/propertyContactRequests");

const seedPlans =
    require("./seed/planSeed");

const seedPlanLimits =
    require("./seed/planLimitSeed");

const seedSuperAdmin =
    require("./seed/superAdminSeed");
const runMigrations =
    require("./migrate");

async function initializeDatabase() {

    await createRestaurantsTable();

    await createUsersTable();

    await createSchoolsTable();

    await createStudentsTable();

    await createFeeStructuresTable();

    await createFeePaymentsTable();

    await createAttendanceTable();
    await createHolidaysTable();

    await createTeachersTable();

    await createDesignationsTable();
    await createAttendanceUserClassesTable();

    await createSalaryStructuresTable();

    await createClassesTable();

    await createEmailOtpsTable();

    await createPlansTable();

    await createPlanPricingTable();

    await createPlanLimitsTable();

    await createSubscriptionOrdersTable();

    await createSubscriptionRequestsTable();

    await createSuperAdminTable();

    await createAppVersionTable();

    await createPropertyUsersTable();

    await createPropertyListingsTable();

    await createPropertyListingImagesTable();
    await createPropertyListingSavesTable();

    await createPropertyContactRequestsTable();

    await runMigrations();

    await seedPlans();

    await seedPlanLimits();

    await seedSuperAdmin();

}

module.exports =
    initializeDatabase;