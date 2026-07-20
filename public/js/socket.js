function playNotificationSound() {

    const audio = new Audio("/sounds/notification.mp3");

    audio.play().catch(() => {});

}

function showSocketNotification(title, message) {

    if (typeof Toast === "undefined") {

        return;

    }

    Toast.show(
        `${title}\n${message}`,
        "success"
    );

}
const socket = io();

socket.on("connect", () => {

    const restaurantId =
        localStorage.getItem("restaurant_id");

    if (!restaurantId) return;


    socket.emit("joinRestaurant", restaurantId);

    const path = window.location.pathname;


    if (path.includes("kitchen")) {

        socket.emit("joinKitchen", restaurantId);

    }

    else if (path.includes("waiter")) {

        const staff = JSON.parse(
    localStorage.getItem("staff") || "{}"
);

socket.emit("joinWaiter", {
    restaurantId,
    staffId: staff.id
});

    }

    else if (path.includes("cashier")) {

        socket.emit("joinBilling", restaurantId);

    }

});

socket.on("disconnect", () => {

});

socket.on("new-order", async (data) => {

    playNotificationSound();

    showSocketNotification(
        "🔔 New Order",
        `Table ${data.tableId} • ${data.ticketNumber}`
    );

    if (typeof loadKitchenTickets === "function") {
        await loadKitchenTickets();
    }

    if (typeof loadCurrentOrder === "function") {
        await loadCurrentOrder();
    }

});

socket.on("ticket-ready", async data => {

    playNotificationSound();

    showSocketNotification(
        "🍽️ KOT Ready",
        `${data.tableName}\n${data.ticketNumber}`
    );

    if (typeof loadCurrentOrder === "function") {
        await loadCurrentOrder();
    }

    if (typeof loadExistingOrder === "function") {
        await loadExistingOrder();
    }

    if (typeof renderCart === "function") {
        renderCart();
    }

});

socket.on("ticket-updated", data => {


    if (typeof loadKitchenTickets === "function") {

        loadKitchenTickets();

    }

    if (typeof loadCurrentOrder === "function") {

        loadCurrentOrder();

    }

});

socket.on("billing-updated", data => {


    if (typeof loadCurrentOrder === "function") {

        loadCurrentOrder();

    }

});

socket.on("order-updated", async data => {


    if (typeof loadExistingOrder === "function") {

        await loadExistingOrder();


    }

    if (typeof renderCart === "function") {


        renderCart();

    }

});
