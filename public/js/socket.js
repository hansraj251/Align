function playNotificationSound() {

    const audio = new Audio("/sounds/notification.wav");

    audio.play().catch(() => {});

}

function showSocketNotification(title, message) {

    if (typeof Toast === "undefined") {

        console.warn("Toast not loaded");

        return;

    }

    Toast.show(
        `${title}\n${message}`,
        "success"
    );

}
const socket = io();

socket.on("connect", () => {

    console.log("🟢 Connected:", socket.id);

    const restaurantId =
        localStorage.getItem("restaurant_id");

    if (!restaurantId) return;

    console.log("Joining Restaurant:", restaurantId);

    socket.emit("joinRestaurant", restaurantId);

    const path = window.location.pathname;

    console.log("PATH =", path);

    if (path.includes("kitchen")) {

        console.log("➡️ Joining Kitchen");

        socket.emit("joinKitchen", restaurantId);

    }

    else if (path.includes("waiter")) {

        console.log("➡️ Joining Waiter");

        socket.emit("joinWaiter", restaurantId);

    }

    else if (path.includes("cashier")) {

        console.log("➡️ Joining Billing");

        socket.emit("joinBilling", restaurantId);

    }

});

socket.on("disconnect", () => {

    console.log("🔴 Disconnected");

});

socket.on("new-order", async (data) => {

    console.log("🔔 New Order", data);

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

    console.log("🍽️ KOT Ready", data);

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

    console.log("🍳 Ticket Updated", data);

    if (typeof loadKitchenTickets === "function") {

        loadKitchenTickets();

    }

    if (typeof loadCurrentOrder === "function") {

        loadCurrentOrder();

    }

});

socket.on("billing-updated", data => {

    console.log("💰 Billing Updated", data);

    if (typeof loadCurrentOrder === "function") {

        loadCurrentOrder();

    }

});

socket.on("order-updated", async data => {

    console.log("🔄 Order Updated", data);

    if (typeof loadExistingOrder === "function") {

        await loadExistingOrder();

    }

    if (typeof renderCart === "function") {

        renderCart();

    }

});
