const planRepository =
    require("../repositories/planRepository");

const planLimitRepository =
    require("../repositories/planLimitRepository");

exports.getPlans = async () => {

    const plans =
        await planRepository.getAll();

    for (const plan of plans) {

        plan.waiter_devices =
            await planLimitRepository
                .getWaiterDeviceLimit(
                    plan.id
                );

    }

    return plans;

};

exports.getActivePlans = async () => {

    const plans =
        await planRepository.getActive();

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
        await planRepository.getById(
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

    slug,

    displayName,

    description,

    waiterDevices,

    status

) => {

    const existingPlan =
        await planRepository.getById(
            planId
        );

    if (!existingPlan) {

        throw new Error(
            "Plan not found."
        );

    }

    const duplicatePlan =
        await planRepository.getBySlug(
            slug
        );

    if (
        duplicatePlan &&
        duplicatePlan.id !== planId
    ) {

        throw new Error(
            "Plan slug already exists."
        );

    }

    await planRepository.update(

        planId,

        slug,

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

exports.createPlan = async (

    slug,

    displayName,

    description,

    waiterDevices,

    status = "active"

) => {

    const existingPlan =
        await planRepository.getBySlug(
            slug
        );

    if (existingPlan) {

        throw new Error(
            "Plan slug already exists."
        );

    }

    const planId =
        await planRepository.create(

            slug,

            displayName,

            description,

            status

        );

    await planLimitRepository
        .updateWaiterDeviceLimit(

            planId,

            waiterDevices

        );

    return planId;

};

exports.deletePlan = async (
    planId
) => {

    const plan =
        await planRepository.getById(
            planId
        );

    if (!plan) {

        throw new Error(
            "Plan not found."
        );

    }

    await planRepository.remove(
        planId
    );

};