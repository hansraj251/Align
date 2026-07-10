function playNotificationSound() {

    const audio = new Audio("/sounds/notification.wav");

    audio.play().catch(() => {});

}

function showSocketNotification(title, message) {

    if (typeof Toast !== "undefined") {

        Toast.show(
            `${title}\n${message}`,
            "success"
        );

    } else {

        alert(`${title}\n${message}`);

    }

}
const socket = io();

socket.on("connect", () => {

    console.log("🟢 Connected:", socket.id);

    const restaurantId =
        localStorage.getItem("restaurant_id");

    if (restaurantId) {

        console.log("Joining Restaurant:", restaurantId);

        socket.emit(
            "joinRestaurant",
            restaurantId
        );
         console.log("joinRestaurant emitted");

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
        `${data.tableName}
${data.ticketNumber}`
    );

    if (typeof loadCurrentOrder === "function") {

        await loadCurrentOrder();

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
