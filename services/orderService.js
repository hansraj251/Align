const orderRepository = require("../repositories/orderRepository");
const menuRepository = require("../repositories/menuRepository");
const tableRepository = require("../repositories/tableRepository");

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

    orderId =
        await orderRepository.createOrder(
            restaurantId,
            table_id
        );

    const orderNumber =
        `ORD-${String(orderId).padStart(6, "0")}`;

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

        const unitPrice = menu.price;
        const totalPrice = unitPrice * item.quantity;

        subtotal += totalPrice;

        const existingItem =
    await orderRepository.getOrderItem(
        orderId,
        menu.id
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

} else {

    await orderRepository.addOrderItem(
        orderId,
        menu.id,
        item.quantity,
        unitPrice,
        totalPrice
    );

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