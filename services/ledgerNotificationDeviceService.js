const ledgerNotificationDeviceRepository =

    require("../repositories/ledgerNotificationDeviceRepository");

function cleanText(value) {

    if (
        value === undefined ||
        value === null
    ) {

        return null;
    }

    const text =

        String(value).trim();

    return text || null;
}

function validateAccountId(accountId) {

    const numericAccountId =

        Number(accountId);

    if (
        !Number.isInteger(
            numericAccountId
        ) ||
        numericAccountId <= 0
    ) {

        throw new Error(

            "Valid account is required"

        );
    }

    return numericAccountId;
}

function validateFcmToken(fcmToken) {

    const token =

        cleanText(fcmToken);

    if (!token) {

        throw new Error(

            "FCM token is required"

        );
    }

    return token;
}

function validatePlatform(platform) {

    const value =

        cleanText(platform) || "android";

    if (
        value !== "android"
    ) {

        throw new Error(

            "Unsupported notification platform"

        );
    }

    return value;
}

async function registerDevice(

    accountId,

    fcmToken,

    platform

) {

    const validatedAccountId =

        validateAccountId(

            accountId

        );

    const validatedToken =

        validateFcmToken(

            fcmToken

        );

    const validatedPlatform =

        validatePlatform(

            platform

        );

    return await ledgerNotificationDeviceRepository

        .save(

            validatedAccountId,

            validatedToken,

            validatedPlatform

        );

}

async function getDevices(

    accountId

) {

    const validatedAccountId =

        validateAccountId(

            accountId

        );

    return await ledgerNotificationDeviceRepository

        .getByAccountId(

            validatedAccountId

        );

}

async function unregisterDevice(

    accountId,

    fcmToken

) {

    const validatedAccountId =

        validateAccountId(

            accountId

        );

    const validatedToken =

        validateFcmToken(

            fcmToken

        );

    await ledgerNotificationDeviceRepository

        .delete(

            validatedAccountId,

            validatedToken

        );

}

async function unregisterAllDevices(

    accountId

) {

    const validatedAccountId =

        validateAccountId(

            accountId

        );

    await ledgerNotificationDeviceRepository

        .deleteAllByAccountId(

            validatedAccountId

        );

}

module.exports = {

    registerDevice,

    getDevices,

    unregisterDevice,

    unregisterAllDevices

};
