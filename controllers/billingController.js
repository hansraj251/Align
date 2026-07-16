const billingService =
    require("../services/billingService");

exports.getReadyOrders = async (
    req,
    res
) =>
{
    try
    {
        const orders =
            await billingService.getReadyOrders(
                req.user.restaurantId
            );

        return res.json({
            success: true,
            orders
        });
    }
    catch (error)
    {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.payOrder = async (
    req,
    res
) =>
{
    try
    {
        const result =
            await billingService.payOrder(
                req.user.restaurantId,
                req.body
            );

        return res.json(result);
    }
    catch (error)
    {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};
exports.payOrder = async (
    req,
    res
) =>
{console.log(req.body);
    try
    {
        const result =
            await billingService.payOrder(
                req.user.restaurantId,
                req.body
            );

        return res.json(result);
    }
    catch (error)
    {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};