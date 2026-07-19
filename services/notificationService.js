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