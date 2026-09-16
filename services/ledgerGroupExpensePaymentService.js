const ledgerGroupExpenseRepository =
    require("../repositories/ledgerGroupExpenseRepository");

const ledgerGroupExpensePaymentRepository =
    require("../repositories/ledgerGroupExpensePaymentRepository");

const ledgerGroupMemberRepository =
    require("../repositories/ledgerGroupMemberRepository");

function roundAmount(value) {
    return Math.round((value + Number.EPSILON) * 100) / 100;
}

function validateAmount(value) {
    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {
        throw new Error(
            "Payment amount is required"
        );
    }

    const numericAmount = Number(value);

    if (
        !Number.isFinite(numericAmount) ||
        numericAmount <= 0
    ) {
        throw new Error(
            "Payment amount must be a valid positive amount"
        );
    }

    return roundAmount(numericAmount);
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

async function getExpenseAndMembers(
    accountId,
    groupId,
    expenseId
) {
    await requireActiveMember(
        accountId,
        groupId
    );

    const expense =
        await ledgerGroupExpenseRepository
            .getById(
                expenseId,
                groupId
            );

    if (!expense) {
        throw new Error(
            "Group expense not found"
        );
    }

    const members =
        await ledgerGroupMemberRepository
            .getByGroupId(groupId);

    if (!members.length) {
        throw new Error(
            "Group has no active members"
        );
    }

    return {
        expense,
        members
    };
}

function validatePayments(
    amount,
    members,
    payments
) {
    if (!Array.isArray(payments)) {
        throw new Error(
            "Payment data is required"
        );
    }

    if (!payments.length) {
        throw new Error(
            "At least one payment is required"
        );
    }

    const memberIds = new Set();

    let totalAmount = 0;

    const validatedPayments =
        payments.map(
            (payment) => {

                const member =
                    members.find(
                        (value) =>
                            Number(value.id) ===
                            Number(payment.member_id)
                    );

                if (!member) {
                    throw new Error(
                        "Invalid member in payment"
                    );
                }

                const memberId =
                    Number(member.id);

                if (
                    memberIds.has(memberId)
                ) {
                    throw new Error(
                        "A member cannot be added as payer more than once"
                    );
                }

                memberIds.add(memberId);

                const paymentAmount =
                    validateAmount(
                        payment.amount
                    );

                totalAmount =
                    roundAmount(
                        totalAmount +
                        paymentAmount
                    );

                return {
                    member_id: memberId,
                    amount: paymentAmount
                };
            }
        );

    if (
        Math.abs(
            totalAmount - amount
        ) > 0.01
    ) {
        throw new Error(
            "Payment amounts must equal the expense amount"
        );
    }

    return validatedPayments;
}

async function savePayments(
    expenseId,
    payments
) {
    await ledgerGroupExpensePaymentRepository
        .removeByExpenseId(expenseId);

    for (const payment of payments) {
        await ledgerGroupExpensePaymentRepository
            .create(
                expenseId,
                payment.member_id,
                payment.amount
            );
    }

    return ledgerGroupExpensePaymentRepository
        .getByExpenseId(expenseId);
}

async function setPayments(
    accountId,
    groupId,
    expenseId,
    payments
) {
    const {
        expense,
        members
    } = await getExpenseAndMembers(
        accountId,
        groupId,
        expenseId
    );

    const validatedPayments =
        validatePayments(
            Number(expense.amount),
            members,
            payments
        );

    return savePayments(
        expenseId,
        validatedPayments
    );
}

async function getPayments(
    accountId,
    groupId,
    expenseId
) {
    await getExpenseAndMembers(
        accountId,
        groupId,
        expenseId
    );

    return ledgerGroupExpensePaymentRepository
        .getByExpenseId(expenseId);
}

module.exports = {
    setPayments,
    getPayments
};
