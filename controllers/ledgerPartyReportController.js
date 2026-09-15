const ledgerPartyReportService =
    require("../services/ledgerPartyReportService");

exports.getLinkedParties =
async (req, res) => {
    try {
        const parties =
            await ledgerPartyReportService
                .getLinkedPartiesByAccountEmail(
                    req.alignAccount.email
                );

        return res.json({
            success: true,
            parties
        });
    } catch (err) {
        console.error(
            "Ledger linked parties error:",
            err.message
        );

        return res.status(404).json({
            success: false,
            message: err.message
        });
    }
};

exports.getPartyReport =

async (req, res) => {

    try {

        const report =
            await ledgerPartyReportService
                .getReportByAccountEmail(
                    req.alignAccount.email,
                    req.params.partyId
                );

        return res.json({

            success: true,

            report

        });

    } catch (err) {

        console.error(
            "Ledger party report error:",
            err.message
        );

        return res.status(404).json({

            success: false,

            message: err.message

        });

    }

};
