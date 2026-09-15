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
