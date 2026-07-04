const orderRepository = require("../repositories/orderRepository");
const menuRepository = require("../repositories/menuRepository");
const tableRepository = require("../repositories/tableRepository");
const kitchenService =

    require("./kitchenService");
const {
    generateNumber
} = require("../utils/numberGenerator");  
const variantRepository =
    require("../repositories/menuVariantRepository");  
const kitchenRepository =
    require("../repositories/kitchenRepository");

exports.checkout = async (restaurantId, body) => {

    const { table_id, items } = body;

    if (!table_id) {
        throw new Error("Table is required");
    }

    if (!items || items.length === 0) {
        throw new Error("Cart is empty");
    }

    const db = require("../db");

return await db.transaction(async () => {

    let order =
    await orderRepository.getActiveOrderByTable(
        restaurantId,
        table_id
    );

let orderId;

if (order) {

    orderId = order.id;

} else {

    const table =
    await tableRepository.getTableDetails(
        restaurantId,
        table_id
    );

if (!table) {

    throw new Error(
        "Table not found"
    );

}

orderId =
    await orderRepository.createOrder(

        restaurantId,

        table_id,

        table.name,

        table.area_name

    );

    const lastOrder =
    await orderRepository.getLastOrderNumberForToday();

const orderNumber =
    generateNumber(
        "ORD",
        lastOrder?.order_number
    );

await orderRepository.updateOrderNumber(
    orderId,
    orderNumber
);

}

let subtotal = 0;

    for (const item of items) {

        const menu =
            await menuRepository.getMenuItemById(
                item.menu_item_id
            );

        if (!menu) {
            throw new Error("Menu item not found");
        }

        if (!menu.is_available) {
            throw new Error(`${menu.name} is unavailable`);
        }
        let variant = null;

if (item.variant_id) {

    variant =
        await variantRepository.getVariantById(
            item.variant_id
        );

    if (!variant) {

        throw new Error(
            "Invalid variant"
        );

    }

    if (
        variant.menu_item_id !==
        menu.id
    ) {

        throw new Error(
            "Variant does not belong to menu item"
        );

    }

}

        const unitPrice =
    variant ? variant.price : menu.price;
        const totalPrice = unitPrice * item.quantity;

        subtotal += totalPrice;

        const existingItem =
    await orderRepository.getOrderItem(

        orderId,

        menu.id,

        variant?.id || null

    );

if (existingItem) {

    const newQuantity =
        existingItem.quantity + item.quantity;

    const newTotal =
        newQuantity * unitPrice;

    await orderRepository.updateOrderItem(
        existingItem.id,
        newQuantity,
        newTotal
    );
    item.order_item_id = existingItem.id;

} else {

    const orderItemId =
    await orderRepository.addOrderItem(

        orderId,

        menu.id,

        menu.name,

        menu.food_type,

        variant?.id || null,

        variant?.name || null,

        item.quantity,

        unitPrice,

        totalPrice

    );

item.order_item_id = orderItemId;

}

    }
const totals =
    await orderRepository.getOrderSubtotal(
        orderId
    );

subtotal = totals.subtotal;
    const tax = subtotal * 0.05;
    const discount = 0;
    const total = subtotal + tax - discount;

    await orderRepository.updateTotals(
        orderId,
        subtotal,
        tax,
        discount,
        total,
        "sent_to_kitchen"
    );

    await tableRepository.updateStatus(
        table_id,
        "occupied"
    );
    console.log("Items before kitchen:", JSON.stringify(items, null, 2));
const kitchenTicket =
    await kitchenService.createKitchenTicket(
        orderId,
        items
    );
    return {
        success: true,
        message: "Order sent to kitchen",
        orderId,
        subtotal,
        tax,
        total
    };

});

};
exports.getActiveOrderByTable = async (
    restaurantId,
    tableId
) => {

    return await orderRepository.getActiveOrderByTable(

        restaurantId,

        tableId

    );

};
exports.getOrder = async (
    restaurantId,
    orderId
) => {

    const order =
        await orderRepository.getOrderDetails(
            restaurantId,
            orderId
        );

    if (!order) {

        throw new Error(
            "Order not found"
        );

    }

    const items =
        await orderRepository.getOrderItems(
            orderId
        );

    return {

        success: true,

        order,

        items

    };

};
exports.getOrderHistory = async (
    restaurantId,
    fromDate,
    toDate
) => {

    const orders =
        await orderRepository.getOrderHistory(
            restaurantId,
            fromDate,
            toDate
        );

    return {

        success: true,

        orders

    };

};
