const ledgerNotificationDeviceService =

    require("../services/ledgerNotificationDeviceService");

exports.registerDevice =

async (req, res) => {

    try {

        const device =

            await ledgerNotificationDeviceService

                .registerDevice(

                    req.alignAccountId,

                    req.body.fcmToken,

                    req.body.platform

                );

        return res.status(201).json({

            success: true,

            device

        });

    } catch (err) {

        console.error(

            "Ledger register notification device error:",

            err.message

        );

        return res.status(400).json({

            success: false,

            message: err.message

        });

    }

};

exports.getDevices =

async (req, res) => {

    try {

        const devices =

            await ledgerNotificationDeviceService

                .getDevices(

                    req.alignAccountId

                );

        return res.json({

            success: true,

            devices

        });

    } catch (err) {

        console.error(

            "Ledger get notification devices error:",

            err.message

        );

        return res.status(400).json({

            success: false,

            message: err.message

        });

    }

};

exports.unregisterDevice =

async (req, res) => {

    try {

        await ledgerNotificationDeviceService

            .unregisterDevice(

                req.alignAccountId,

                req.body.fcmToken

            );

        return res.json({

            success: true,

            message:

                "Notification device removed successfully"

        });

    } catch (err) {

        console.error(

            "Ledger unregister notification device error:",

            err.message

        );

        return res.status(400).json({

            success: false,

            message: err.message

        });

    }

};

exports.unregisterAllDevices =

async (req, res) => {

    try {

        await ledgerNotificationDeviceService

            .unregisterAllDevices(

                req.alignAccountId

            );

        return res.json({

            success: true,

            message:

                "All notification devices removed successfully"

        });

    } catch (err) {

        console.error(

            "Ledger unregister all notification devices error:",

            err.message

        );

        return res.status(400).json({

            success: false,

            message: err.message

        });

    }

};
