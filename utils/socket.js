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
            socket.join(`kitchen_${restaurantId}`);
            socket.join(`waiter_${restaurantId}`);
            socket.join(`billing_${restaurantId}`);

            console.log(
                `Socket ${socket.id} joined restaurant_${restaurantId}`
            );

        });

        socket.on("disconnect", () => {

            console.log("❌ Client Disconnected:", socket.id);

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