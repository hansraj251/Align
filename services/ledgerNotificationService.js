const firebaseService =
    require("./firebaseService");

const ledgerNotificationDeviceRepository =
    require("../repositories/ledgerNotificationDeviceRepository");

async function sendToAccount(
    accountId,
    title,
    body,
    data = {}
) {
    const devices =
        await ledgerNotificationDeviceRepository
            .getTokensByAccountId(
                accountId
            );

    for (
        const device of devices
    ) {
        await firebaseService
            .sendToToken(
                device.fcm_token,
                title,
                body,
                data
            );
    }
}

async function sendToAccounts(
    accountIds,
    title,
    body,
    data = {}
) {
    const uniqueAccountIds =
        [
            ...new Set(
                accountIds
                    .map(
                        accountId =>
                            Number(accountId)
                    )
                    .filter(
                        accountId =>
                            Number.isInteger(
                                accountId
                            ) &&
                            accountId > 0
                    )
            )
        ];

    for (
        const accountId of uniqueAccountIds
    ) {
        await sendToAccount(
            accountId,
            title,
            body,
            data
        );
    }
}

module.exports = {
    sendToAccount,
    sendToAccounts
};
