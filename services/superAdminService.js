const superAdminRepository =
    require("../repositories/superAdminRepository");

exports.getDashboardStats =
async () => {

    return await
        superAdminRepository
            .getDashboardStats();

};

exports.getRestaurants =
async () => {

    return await
        superAdminRepository
            .getRestaurants();

};