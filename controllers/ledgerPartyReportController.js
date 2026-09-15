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

        const account =

            parties[0]?.ownerAccount || null;

        const cleanParties =

            parties.map(

                (party) => ({

                    id: party.id,

                    name: party.name,

                    mobile: party.mobile,

                    email: party.email

                })

            );

        return res.json({

            success: true,

            account,

            parties: cleanParties

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

        const result =

            await ledgerPartyReportService

                .getReportByAccountEmail(

                    req.alignAccount.email,

                    req.params.partyId

                );

        return res.json({

            success: true,

            account: result.ownerAccount,

            report: result.report

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