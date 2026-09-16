const ledgerGroupSettlementRepository =
    require("../repositories/ledgerGroupSettlementRepository");

const ledgerGroupMemberRepository =
    require("../repositories/ledgerGroupMemberRepository");

function cleanText(value) {
    if (value === undefined || value === null) return null;

    const text = String(value).trim();

    return text || null;
}

function validateAmount(amount) {
    if (
        amount === undefined ||
        amount === null ||
        amount === ""
    ) {
        throw new Error(
            "Settlement amount is required"
        );
    }

    const numericAmount = Number(amount);

    if (
        !Number.isFinite(numericAmount) ||
        numericAmount <= 0
    ) {
        throw new Error(
            "Settlement amount must be a valid positive amount"
        );
    }

    return Math.round(
        (numericAmount + Number.EPSILON) * 100
    ) / 100;
}

function validateSettlementDate(date) {
    const cleanedDate =
        cleanText(date);

    if (!cleanedDate) {
        return new Date()
            .toISOString()
            .slice(0,10);
    }

    if (
        !/^\d{4}-\d{2}-\d{2}$/
            .test(cleanedDate)
    ) {
        throw new Error(
            "Settlement date must be in YYYY-MM-DD format"
        );
    }

    return cleanedDate;
}

async function requireActiveMember(
    accountId,
    groupId
) {
    const member =
        await ledgerGroupMemberRepository
            .getByGroupAndAccount(
                groupId,
                accountId
            );

    if (
        !member ||
        member.status !== "active"
    ) {
        throw new Error(
            "You are not an active member of this group"
        );
    }

    return member;
}

async function getMember(
    groupId,
    memberId
) {
    const member =
        await ledgerGroupMemberRepository
            .getById(
                memberId,
                groupId
            );

    if (
        !member ||
        member.status !== "active"
    ) {
        throw new Error(
            "Settlement member is not an active member of this group"
        );
    }

    return member;
}

async function getSettlements(
    accountId,
    groupId
) {
    await requireActiveMember(
        accountId,
        groupId
    );

    return ledgerGroupSettlementRepository
        .getByGroupId(groupId);
}

async function getSettlement(
    accountId,
    groupId,
    settlementId
) {
    await requireActiveMember(
        accountId,
        groupId
    );

    const settlement =
        await ledgerGroupSettlementRepository
            .getById(
                settlementId,
                groupId
            );

    if (!settlement) {
        throw new Error(
            "Settlement not found"
        );
    }

    return settlement;
}

async function createSettlement(
    accountId,
    groupId,
    paidByMemberId,
    paidToMemberId,
    amount,
    settlementDate,
    notes
) {
    await requireActiveMember(
        accountId,
        groupId
    );

    const paidBy =
        await getMember(
            groupId,
            paidByMemberId
        );

    const paidTo =
        await getMember(
            groupId,
            paidToMemberId
        );

    if (
        Number(paidBy.id) ===
        Number(paidTo.id)
    ) {
        throw new Error(
            "Settlement payer and receiver cannot be the same member"
        );
    }

    const validatedAmount =
        validateAmount(amount);

    const validatedDate =
        validateSettlementDate(
            settlementDate
        );

    const cleanedNotes =
        cleanText(notes);

    if (
        cleanedNotes &&
        cleanedNotes.length > 1000
    ) {
        throw new Error(
            "Settlement notes must not exceed 1000 characters"
        );
    }

    return ledgerGroupSettlementRepository
        .create(
            groupId,
            paidBy.id,
            paidTo.id,
            validatedAmount,
            validatedDate,
            cleanedNotes
        );
}

async function deleteSettlement(
    accountId,
    groupId,
    settlementId
) {
    await requireActiveMember(
        accountId,
        groupId
    );

    const settlement =
        await ledgerGroupSettlementRepository
            .getById(
                settlementId,
                groupId
            );

    if (!settlement) {
        throw new Error(
            "Settlement not found"
        );
    }

    await ledgerGroupSettlementRepository
        .remove(
            settlementId,
            groupId
        );
}

module.exports = {
    getSettlements,
    getSettlement,
    createSettlement,
    deleteSettlement
};
