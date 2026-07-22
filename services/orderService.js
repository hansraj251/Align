const orderRepository = require("../repositories/orderRepository");
const menuRepository = require("../repositories/menuRepository");
const tableRepository = require("../repositories/tableRepository");
const settingsRepository =
    require("../repositories/settingsRepository");  
const kitchenService =

    require("./kitchenService");
const {
    generateNumber
} = require("../utils/numberGenerator");  
const variantRepository =
    require("../repositories/menuVariantRepository");  
const kitchenRepository =
    require("../repositories/kitchenRepository");
const { getIO } =
    require("../utils/socket");    
const defaultSetupService =
    require("./defaultSetupService");    
const orderCalculationService =
    require("./orderCalculationService");    
const subscriptionService =
    require("./subscriptionService");   
const restaurantRepository =
    require("../repositories/restaurantRepository");     
const orderParticipantRepository =
    require("../repositories/orderParticipantRepository");  
const notificationService =
    require("./notificationService");    
const quickItemRepository =
    require("../repositories/quickItemRepository");    
    

exports.checkout = async (
    restaurantId,
    body,
    staffId
) => {

    await subscriptionService
        .validateRestaurant(
            restaurantId
        );

    const {
        table_id,
        items
    } = body;

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

    await orderParticipantRepository.addParticipant(
        orderId,
        staffId
    );

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
const settings =
    await settingsRepository.getSettings(
        restaurantId
    );
const restaurant =
    await restaurantRepository.getRestaurantForReceipt(
        restaurantId
    );    

orderId =
    await orderRepository.createOrder(

        restaurantId,

        table_id,

        table.name,

        table.area_name,

        settings.cgst,

        settings.sgst,

        staffId

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

await orderRepository.saveReceiptSnapshot(
    orderId,
    {
        restaurant_name:
            restaurant.name,

        restaurant_address:
[
    restaurant.address,
    restaurant.city,
    restaurant.state,
    restaurant.pincode
]
.filter(Boolean)
.join(", "),

        restaurant_phone:
            restaurant.mobile,

        restaurant_email:
            restaurant.email,

        restaurant_gst:
            restaurant.gst_number,

        restaurant_logo:
            restaurant.logo,

        receipt_footer:
            settings.footer_message,

        cgst:
            settings.cgst,

        sgst:
            settings.sgst
    }
);
await orderParticipantRepository.addParticipant(
    orderId,
    staffId
);

}

let subtotal = 0;

    for (const item of items) {
        


       if (item.is_quick_item) {

    const quickItem =
    await quickItemRepository.getById(

        restaurantId,

        item.quick_item_id

    );


    if (!quickItem) {

        throw new Error(
            "Quick item not found"
        );

    }

    if (!quickItem.active) {

        throw new Error(
            `${quickItem.name} is unavailable`
        );

    }

    const unitPrice =
        quickItem.price;

    const totalPrice =
        unitPrice * item.quantity;

    subtotal += totalPrice;

    const orderItemId =
        await orderRepository.addOrderItem(

            orderId,

            null,

            quickItem.id,

            1,

            quickItem.name,

            null,

            null,

            null,

            item.quantity,

            unitPrice,

            totalPrice

        );

    item.order_item_id =
        orderItemId;

    continue;

}

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

        const orderItemId =
    await orderRepository.addOrderItem(

        orderId,

        menu.id,

        null,

        0,

        menu.name,

        menu.food_type,

        variant?.id || null,

        variant?.name || null,

        item.quantity,

        unitPrice,

        totalPrice

    );

item.order_item_id =
    orderItemId;


item.order_item_id = orderItemId;

    }
const totals =
    await orderCalculationService.calculateOrderTotals(
        orderId
    );

await orderRepository.updateTotals(
    orderId,
    totals.subtotal,
    totals.tax,
    totals.discountPercent,
    totals.total,
    "sent_to_kitchen"
);

    await tableRepository.updateStatus(
    table_id,
    "occupied"
);

const table =
    await tableRepository.getById(
        restaurantId,
        table_id
    );

if (table.system_key === "takeaway") {

    await defaultSetupService.ensureNextTakeAwayTable(
        restaurantId
    );

}
    
const kitchenItems =
    items.filter(
        item => !item.is_quick_item
    );
if (kitchenItems.length > 0) {

    const kitchenTicket =
        await kitchenService.createKitchenTicket(
            orderId,
            kitchenItems
        );

    await notificationService.sendNewKitchenOrderNotification(
        restaurantId,
        {
            orderId,
            ticketId: kitchenTicket.ticketId,
            tableName: table.name
        }
    );

const io = getIO();

io.to(`kitchen_${restaurantId}`).emit(
    "new-order",
    {
        orderId,
        tableId: table_id,
        kitchenTicketId: kitchenTicket.ticketId,
        ticketNumber: kitchenTicket.ticketNumber,
        time: Date.now()
    }
);}
    return {
    success: true,
    message: "Order sent to kitchen",
    orderId,
    subtotal: totals.subtotal,
    tax: totals.tax,
    total: totals.total
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
exports.sendToBilling = async (
    orderId
) => {

    const activeTickets =
        await kitchenRepository.getActiveTicketsByOrder(
            orderId
        );
    const orderItems =
    await orderRepository.getOrderItems(
        orderId
    );

const hasQuickItems =
    orderItems.some(
        item => item.is_quick_item
    );    
        

    // Pehle hi process ho chuka hai
    if (activeTickets.length === 0) {

    if (!hasQuickItems) {

        return {

            success: true,

            alreadyProcessed: true

        };

    }

}

    for (const ticket of activeTickets) {

        // Ready items ko served karo
        await kitchenRepository.updateTicketItemsStatus(
            ticket.id,
            "served"
        );

        // Ticket close karo
        await kitchenRepository.updateTicketStatus(
            ticket.id,
            "served"
        );

    }

    // Order billing me bhejo
    await orderRepository.updateOrderStatus(
        orderId,
        "ready_for_billing"
    );
    const order =
    await orderRepository.getOrderDetailsById(
        orderId
    );

const io = getIO();

io.to(`billing_${order.restaurant_id}`).emit(
    "ready-for-billing",
    {
        orderId: order.id,
        orderNumber: order.order_number,
        tableId: order.table_id,
        tableName: order.table_name
    }
);

    return {

        success: true

    };

};

exports.removeQuickItem = async (
    restaurantId,
    orderItemId
) => {

    const orderItem =
        await orderRepository.getOrderItemById(
            orderItemId
        );

    if (!orderItem) {

        throw new Error(
            "Quick item not found"
        );

    }

    if (
        orderItem.restaurant_id !==
        restaurantId
    ) {

        throw new Error(
            "Invalid quick item"
        );

    }

    if (
        !orderItem.is_quick_item
    ) {

        throw new Error(
            "Invalid quick item"
        );

    }
    const changes =
    await orderRepository.removeQuickItem(
        orderItemId
    );

if (changes === 0) {

    throw new Error(
        "Quick item could not be removed"
    );

}

const totals =
    await orderCalculationService.calculateOrderTotals(
        orderItem.order_id
    );

await orderRepository.updateOrderTotals(
    orderItem.order_id,
    totals
);

return {
    success: true
};
    

};

exports.closeOrder = async (
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

    await orderRepository.closeOrder(
        orderId
    );

    await tableRepository.updateStatus(
        order.table_id,
        "available"
    );

    return {

        success: true

    };

};