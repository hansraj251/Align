const ledgerInterestReceivedRepository =
    require("../repositories/ledgerInterestReceivedRepository");

const ledgerPartyRepository =
    require("../repositories/ledgerPartyRepository");

const ledgerBusinessService =
    require("./ledgerBusinessService");

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

function validateAmount(amount) {
    if (
        amount === undefined ||
        amount === null ||
        amount === ""
    ) {
        throw new Error(
            "Interest amount is required"
        );
    }

    const value = Number(amount);

    if (
        !Number.isFinite(value) ||
        value === 0
    ) {
        throw new Error(
            "Interest amount must be a valid non-zero amount"
        );
    }

    return value;
}

function validateInterestDate(interestDate) {
    const date =
        cleanText(interestDate);

    if (!date) {
        throw new Error(
            "Interest date is required"
        );
    }

    if (
        !/^\d{4}-\d{2}-\d{2}$/.test(date)
    ) {
        throw new Error(
            "Interest date must be in YYYY-MM-DD format"
        );
    }

    const parsed =
        new Date(`${date}T00:00:00Z`);

    if (
        Number.isNaN(parsed.getTime()) ||
        parsed.toISOString().slice(0, 10) !== date
    ) {
        throw new Error(
            "Interest date is invalid"
        );
    }

    return date;
}

async function getPartyForAccount(
    accountId,
    partyId
) {
    const business =
        await ledgerBusinessService
            .getBusiness(accountId);

    const party =
        await ledgerPartyRepository
            .getById(
                partyId,
                business.id
            );

    if (!party) {
        throw new Error(
            "Party not found"
        );
    }

    return party;
}

async function getInterestReceived(
    accountId,
    partyId
) {
    const party =
        await getPartyForAccount(
            accountId,
            partyId
        );

    const entries =
        await ledgerInterestReceivedRepository
            .getByPartyId(party.id);

    const summary =
        await ledgerInterestReceivedRepository
            .getTotalByPartyId(party.id);

    return {
        entries,
        totalInterestReceived:
            Number(
                summary.total_interest_received || 0
            )
    };
}

async function createInterestReceived(
    accountId,
    partyId,
    {
        interestDate,
        amount,
        note
    }
) {
    const party =
        await getPartyForAccount(
            accountId,
            partyId
        );

    const validatedDate =
        validateInterestDate(
            interestDate
        );

    const validatedAmount =
        validateAmount(amount);

    return await ledgerInterestReceivedRepository
        .create(
            party.id,
            validatedDate,
            validatedAmount,
            cleanText(note)
        );
}

async function updateInterestReceived(
    accountId,
    partyId,
    interestId,
    {
        interestDate,
        amount,
        note
    }
) {
    const party =
        await getPartyForAccount(
            accountId,
            partyId
        );

    const existing =
        await ledgerInterestReceivedRepository
            .getById(
                interestId,
                party.id
            );

    if (!existing) {
        throw new Error(
            "Interest entry not found"
        );
    }

    const validatedDate =
        validateInterestDate(
            interestDate
        );

    const validatedAmount =
        validateAmount(amount);

    return await ledgerInterestReceivedRepository
        .update(
            interestId,
            party.id,
            validatedDate,
            validatedAmount,
            cleanText(note)
        );
}

async function deleteInterestReceived(
    accountId,
    partyId,
    interestId
) {
    const party =
        await getPartyForAccount(
            accountId,
            partyId
        );

    const existing =
        await ledgerInterestReceivedRepository
            .getById(
                interestId,
                party.id
            );

    if (!existing) {
        throw new Error(
            "Interest entry not found"
        );
    }

    await ledgerInterestReceivedRepository
        .delete(
            interestId,
            party.id
        );

    return {
        success: true
    };
}

module.exports = {
    getInterestReceived,
    createInterestReceived,
    updateInterestReceived,
    deleteInterestReceived
};
