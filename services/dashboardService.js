const dashboardRepository =
    require("../repositories/dashboardRepository");

exports.getDashboard = async (
    restaurantId
) => {

    const summary =
        await dashboardRepository.getDashboardSummary(
            restaurantId
        );

    const todaySales =
        Number(summary.todaySales || 0);

    const todayOrders =
        Number(summary.todayOrders || 0);

    return {

    success: true,

    todaySales,

    todayOrders,

    averageBill:

        todayOrders > 0
            ? Number(
                (
                    todaySales /
                    todayOrders
                ).toFixed(2)
            )
            : 0,

    occupiedTables:
        summary.occupiedTables,

    totalTables:
        summary.totalTables,

    pendingKitchen:
        summary.pendingKitchen,

    categories:
        summary.categories,

    menuItems:
        summary.menuItems

};

};