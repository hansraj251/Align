const ledgerInterestReceivedService =
    require("../services/ledgerInterestReceivedService");

exports.getInterestReceived =
async (req, res) => {
    try {
        const result =
            await ledgerInterestReceivedService
                .getInterestReceived(
                    req.alignAccountId,
                    req.params.partyId
                );

        return res.json({
            success: true,
            entries: result.entries,
            totalInterestReceived:
                result.totalInterestReceived
        });
    } catch (err) {
        console.error(
            "Ledger get interest received error:",
            err.message
        );

        return res.status(404).json({
            success: false,
            message: err.message
        });
    }
};

exports.createInterestReceived =
async (req, res) => {
    try {
        const entry =
            await ledgerInterestReceivedService
                .createInterestReceived(
                    req.alignAccountId,
                    req.params.partyId,
                    req.body
                );

        return res.status(201).json({
            success: true,
            entry
        });
    } catch (err) {
        console.error(
            "Ledger create interest received error:",
            err.message
        );

        return res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

exports.updateInterestReceived =
async (req, res) => {
    try {
        const entry =
            await ledgerInterestReceivedService
                .updateInterestReceived(
                    req.alignAccountId,
                    req.params.partyId,
                    req.params.interestId,
                    req.body
                );

        return res.json({
            success: true,
            entry
        });
    } catch (err) {
        console.error(
            "Ledger update interest received error:",
            err.message
        );

        return res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

exports.deleteInterestReceived =
async (req, res) => {
    try {
        await ledgerInterestReceivedService
            .deleteInterestReceived(
                req.alignAccountId,
                req.params.partyId,
                req.params.interestId
            );

        return res.json({
            success: true,
            message:
                "Interest entry deleted successfully"
        });
    } catch (err) {
        console.error(
            "Ledger delete interest received error:",
            err.message
        );

        return res.status(404).json({
            success: false,
            message: err.message
        });
    }
};
