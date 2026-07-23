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
            

        if (
            !staff ||
            !staff.fcm_token
        ) {

            return;

        }
try {
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
        );} catch (error) {

    if (
        error.code ===
        "messaging/registration-token-not-registered"
    ) {

        await staffRepository.clearFcmTokenByValue(
            staff.fcm_token
        );

    }

    throw error;

}

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
    "[TOKENS BEFORE SEND]",
    restaurantId,
    staffs
);    
           

        for (const staff of staffs) {
 
            try {

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

} catch (error) {

    if (
        error.code ===
        "messaging/registration-token-not-registered"
    ) {

        await staffRepository.clearFcmTokenByValue(
            staff.fcm_token
        );

    }

    throw error;

}
        }

    };    