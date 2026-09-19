const ledgerGroupSettlementRepository =
    require("../repositories/ledgerGroupSettlementRepository");

const ledgerGroupMemberRepository =
    require("../repositories/ledgerGroupMemberRepository");


const ledgerGroupSummaryService =

    require("./ledgerGroupSummaryService");

const ledgerNotificationService =

    require("./ledgerNotificationService");

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

function getMaximumSettlement(
    payerPendingPay,
    receiverPendingGet
) {
    const payerAmount =
        Number(payerPendingPay) > 0
            ? Number(payerPendingPay)
            : 0;

    const receiverAmount =
        Number(receiverPendingGet) > 0
            ? Number(receiverPendingGet)
            : 0;

    return Math.round(
        Math.min(
            payerAmount,
            receiverAmount
        ) * 100
    ) / 100;
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

    const summary =

        await ledgerGroupSummaryService

            .getSummary(

                accountId,

                groupId

            );

    const balances =

        Array.isArray(summary.members)

            ? summary.members

            : [];

    const payerBalance =

        balances.find(

            (member) =>

                Number(member.member_id) ===

                Number(paidBy.id)

        );

    const receiverBalance =

        balances.find(

            (member) =>

                Number(member.member_id) ===

                Number(paidTo.id)

        );

    const payerPendingPay =

        payerBalance &&

        Number(payerBalance.net_balance) < 0

            ? Math.abs(

                Number(

                    payerBalance.net_balance

                )

            )

            : 0;

    const receiverPendingGet =

        receiverBalance &&

        Number(receiverBalance.net_balance) > 0

            ? Number(

                receiverBalance.net_balance

            )

            : 0;

    const maximumSettlement =
        getMaximumSettlement(
            payerPendingPay,
            receiverPendingGet
        );

    if (

        maximumSettlement <= 0

    ) {

        throw new Error(

            "No pending balance is available for this settlement."

        );

    }

    if (

        validatedAmount >

        maximumSettlement

    ) {

        throw new Error(

            `Maximum settlement amount is ${maximumSettlement}.`

        );

    }

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

    const settlement =

        await ledgerGroupSettlementRepository

            .create(

                groupId,

                paidBy.id,

                paidTo.id,

                validatedAmount,

                validatedDate,

                cleanedNotes

            );

    if (paidBy.account_id) {

        try {

            await ledgerNotificationService

                .sendToAccount(

                    paidBy.account_id,

                    "Settlement",

                    `₹${Number(

                        validatedAmount

                    ).toFixed(2)} settlement recorded with ${paidTo.name}`,

                    {

                        type:

                            "ledger_group_settlement",

                        groupId:

                            String(groupId),

                        settlementId:

                            String(settlement.id)

                    }

                );

        } catch (notificationError) {

            console.error(

                "Ledger group settlement notification error:",

                notificationError.message

            );

        }

    }

    return settlement;

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

    getMaximumSettlement,
    getSettlements,
    getSettlement,
    createSettlement,
    deleteSettlement
};
