const {
    initializeApp,
    cert
} =
    require("firebase-admin/app");

const {
    getMessaging
} =
    require("firebase-admin/messaging");

const fs =
    require("fs");

const path =
    require("path");

let initialized =
    false;

exports.initialize = () => {

    if (initialized) {

        return;

    }

    let serviceAccount;

    if (
        process.env.FIREBASE_SERVICE_ACCOUNT
    ) {

        serviceAccount =
            JSON.parse(
                process.env
                    .FIREBASE_SERVICE_ACCOUNT
            );

    } else {

    let serviceAccountPath =
        "/etc/secrets/firebase-service-account.json";

    if (
        !fs.existsSync(
            serviceAccountPath
        )
    ) {

        serviceAccountPath =
            path.join(
                __dirname,
                "..",
                "config",
                "firebase-service-account.json"
            );

    }

    serviceAccount =
        JSON.parse(
            fs.readFileSync(
                serviceAccountPath,
                "utf8"
            )
        );


}

    initializeApp({

    credential:
        cert(
            serviceAccount
        )

});
    

    initialized =
        true;

};

exports.sendToToken = async (
    fcmToken,
    title,
    body,
    data = {}
) => {

    if (!fcmToken) {

        return;

    }

    try {

        await getMessaging().send({

            token:
                fcmToken,

            notification: {

                title,

                body

            },

            data

        });

    } catch (error) {

        console.error(
            "FCM send failed:",
            error.message
        );

    }

};