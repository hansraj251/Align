const ledgerPartyRepository =
    require("../repositories/ledgerPartyRepository");

const ledgerTransactionRepository =
    require("../repositories/ledgerTransactionRepository");

const ledgerInterestReceivedRepository =
    require("../repositories/ledgerInterestReceivedRepository");

function normalizeEmail(email) {
    const cleanedEmail =
        String(email || "")
            .trim()
            .toLowerCase();

    if (!cleanedEmail) {
        throw new Error(
            "Account email is required"
        );
    }

    return cleanedEmail;
}

async function buildPartyReport(party) {
    const summary =
        await ledgerTransactionRepository
            .getSummaryByPartyId(
                party.id
            );

    const transactions =
        await ledgerTransactionRepository
            .getByPartyId(
                party.id
            );

    const interestReceived =
        await ledgerInterestReceivedRepository
            .getByPartyId(
                party.id
            );

    const interestTotal =
        await ledgerInterestReceivedRepository
            .getTotalByPartyId(
                party.id
            );

    const openingBalance =
        Number(
            party.opening_balance || 0
        );

    const openingCredit =
        party.opening_balance_type === "credit"
            ? openingBalance
            : 0;

    const openingDebit =
        party.opening_balance_type === "debit"
            ? openingBalance
            : 0;

    const totalCredit =
        openingCredit +
        Number(
            summary.total_credit || 0
        );

    const totalDebit =
        openingDebit +
        Number(
            summary.total_debit || 0
        );

    const netBalance =
        totalCredit -
        totalDebit;

    return {
        party,
        summary: {
            total_credit: totalCredit,
            total_debit: totalDebit,
            net_balance: netBalance,
            balance_type:
                netBalance > 0
                    ? "receivable"
                    : netBalance < 0
                        ? "payable"
                        : "settled"
        },
        transactions,
        interestReceived,
        totalInterestReceived:
            Number(
                interestTotal.total_interest_received || 0
            )
    };
}

async function getReportByAccountEmail(
    email,
    partyId
) {
    const normalizedEmail =
        normalizeEmail(email);

    const parties =
        await ledgerPartyRepository
            .getByEmail(
                normalizedEmail
            );

    const party =
        parties.find(
            (item) =>
                String(item.id) ===
                String(partyId)
        );

    if (!party) {
        throw new Error(
            "Party report not found"
        );
    }

    return buildPartyReport(
        party
    );
}

module.exports = {
    getReportByAccountEmail
};
