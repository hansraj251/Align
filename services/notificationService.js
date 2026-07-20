const firebaseService =
    require("./firebaseService");
const staffRepository =
    require("../repositories/staffRepository");    

exports.sendTicketReadyNotification =
    async (
        staffId,
        data
    ) => {

        const staff =
            await staffRepository.getFcmToken(
                staffId
            );
            console.log(
    "[FCM READY]",
    staffId,
    staff
);

        if (
            !staff ||
            !staff.fcm_token
        ) {

            return;

        }

        await firebaseService.sendToToken(
            staff.fcm_token,
            "Order Ready",
            `Table ${data.tableName} order is ready.`,
            {
                orderId:
                    String(data.orderId),
                ticketId:
                    String(data.ticketId)
            }
        );

    };

exports.sendNewKitchenOrderNotification =
    async (
        restaurantId,
        data
    ) => {

        const staffs =
            await staffRepository.getFcmTokensByRole(
                restaurantId,
                "kitchen"
            );
            console.log(
            "[FCM] Kitchen Recipients",
            restaurantId,
            staffs
        );

        for (const staff of staffs) {
 console.log(
                "[FCM] Sending Kitchen",
                staff.fcm_token
            );
            await firebaseService.sendToToken(
                staff.fcm_token,
                "New Kitchen Order",
                `Table ${data.tableName} has a new order.`,
                {
                    orderId:
                        String(data.orderId),
                    ticketId:
                        String(data.ticketId)
                }
            );

        }

    };    