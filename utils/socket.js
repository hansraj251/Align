let io = null;

function init(server) {

    const { Server } = require("socket.io");

    io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    io.on("connection", (socket) => {

        console.log("🔌 Client Connected:", socket.id);

        socket.on("joinRestaurant", (restaurantId) => {

    socket.join(`restaurant_${restaurantId}`);

});

socket.on("joinKitchen", (restaurantId) => {

    socket.join(`kitchen_${restaurantId}`);

    console.log(
        `✅ Kitchen joined kitchen_${restaurantId} (${socket.id})`
    );

});

socket.on("joinWaiter", (restaurantId) => {

    socket.join(`waiter_${restaurantId}`);

    console.log(
        `Waiter joined waiter_${restaurantId}`
    );

});

socket.on("joinBilling", (restaurantId) => {

    socket.join(`billing_${restaurantId}`);

    console.log(
        `Billing joined billing_${restaurantId}`
    );

});

    });

    return io;

}


function getIO() {

    if (!io) {
        throw new Error("Socket.IO not initialized");
    }

    return io;

}

module.exports = {
    init,
    getIO
};