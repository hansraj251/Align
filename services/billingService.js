const billingRepository =
    require("../repositories/billingRepository");
const orderRepository =
    require("../repositories/orderRepository");    
const tableRepository =
    require("../repositories/tableRepository");
const paymentSplitRepository =
    require("../repositories/paymentSplitRepository");    
exports.getReadyOrders = async (
    restaurantId
) =>
{
    return await billingRepository.getReadyOrders(
        restaurantId
    );
};
exports.payOrder = async (
    restaurantId,
    body
) =>
{
    const {
    orderId,
    discountType,
    discountValue,
    paymentMethod,
    splitPayment,
    splitPayments
} = body;
const order =
    await orderRepository.getOrderDetailsById(
        orderId
    );console.log(order);
let discount = 0;

if (discountType === "amount")
{
    discount = discountValue;
}
else
{
    discount =
        (
            order.subtotal *
            discountValue
        ) / 100;
}

if (discount < 0)
{
    discount = 0;
}

if (discount > order.subtotal)
{
    discount = order.subtotal;
}   

const finalTotal =
    order.subtotal -
    discount +
    order.tax;

if (!order)
{
    throw new Error(
        "Order not found"
    );
}

if (
    order.restaurant_id !==
    restaurantId
)
{
    throw new Error(
        "Invalid order"
    );
}

if (
    order.status !==
    "ready_for_billing"
)
{
    throw new Error(
        "Order is not ready for billing"
    );
}    
console.log({
    discountType,
    discountValue,
    subtotal: order.subtotal,
    discount
});
    await billingRepository.payOrder(
    restaurantId,
    orderId,
    discount,
    finalTotal,
    paymentMethod
);
if (
    splitPayment &&
    Array.isArray(splitPayments)
)
{
    await paymentSplitRepository.deleteByOrder(
        orderId
    );

    for (const payment of splitPayments)
    {
        if (payment.amount <= 0)
        {
            continue;
        }

        await paymentSplitRepository.create(
            orderId,
            payment.method,
            payment.amount
        );
    }
}
    await tableRepository.updateStatus(
    order.table_id,
    "available"
);

    return {
        success: true
    };
};