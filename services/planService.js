const planRepository =
    require("../repositories/planRepository");

const planLimitRepository =
    require("../repositories/planLimitRepository");


exports.getPlans = async () => {

    const plans =
        await planRepository.getPlans();

    for (const plan of plans) {

        plan.waiter_devices =
            await planLimitRepository
                .getWaiterDeviceLimit(
                    plan.id
                );

    }

    return plans;

};    

exports.getPlan = async (planId) => {

    const plan =
        await planRepository.getPlanById(
            planId
        );

    if (!plan) {

        throw new Error(
            "Plan not found."
        );

    }

    plan.waiter_devices =
        await planLimitRepository
            .getWaiterDeviceLimit(
                planId
            );

    return plan;

};
exports.updatePlan = async (

    planId,

    displayName,

    description,

    waiterDevices,

    status

) => {

    await planRepository.updatePlan(

        planId,

        displayName,

        description,

        status

    );

    await planLimitRepository
        .updateWaiterDeviceLimit(

            planId,

            waiterDevices

        );

};