const ledgerGroupExpenseRepository =
    require("../repositories/ledgerGroupExpenseRepository");

const ledgerGroupExpenseSplitRepository =
    require("../repositories/ledgerGroupExpenseSplitRepository");

const ledgerGroupMemberRepository =
    require("../repositories/ledgerGroupMemberRepository");

const ledgerNotificationService =

    require("../services/ledgerNotificationService");

function roundAmount(value) {
    return Math.round((value + Number.EPSILON) * 100) / 100;
}

function cleanText(value) {
    if (value === undefined || value === null) return null;

    const text = String(value).trim();

    return text || null;
}

function validatePositiveNumber(value,fieldName) {
    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {
        throw new Error(`${fieldName} is required`);
    }

    const numericValue = Number(value);

    if (
        !Number.isFinite(numericValue) ||
        numericValue <= 0
    ) {
        throw new Error(
            `${fieldName} must be a valid positive number`
        );
    }

    return numericValue;
}

function validateNonNegativeNumber(value,fieldName) {

    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {
        throw new Error(`${fieldName} is required`);
    }

    const numericValue = Number(value);

    if (
        !Number.isFinite(numericValue) ||
        numericValue < 0
    ) {
        throw new Error(
            `${fieldName} must be a valid non-negative number`
        );
    }

    return numericValue;
}

async function requireActiveMember(accountId,groupId) {
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

function calculateEqualSplits(
    amount,
    members
) {
    const baseAmount =
        Math.floor(
            (amount / members.length) * 100
        ) / 100;

    const splits = [];

    let assignedAmount = 0;

    members.forEach(
        (member,index) => {
            let shareAmount =
                baseAmount;

            if (
                index ===
                members.length - 1
            ) {
                shareAmount =
                    roundAmount(
                        amount -
                        assignedAmount
                    );
            }

            assignedAmount =
                roundAmount(
                    assignedAmount +
                    shareAmount
                );

            splits.push({
                member_id: member.id,
                split_value: 1,
                share_amount: shareAmount
            });
        }
    );

    return splits;
}

function calculatePercentageSplits(
    amount,
    members,
    values
) {
    if (!Array.isArray(values)) {
        throw new Error(
            "Percentage split data is required"
        );
    }

    if (values.length !== members.length) {
        throw new Error(
            "Percentage split must include every group member"
        );
    }

    let totalPercentage = 0;

    const splits = values.map(
        (item) => {
            const member =
                members.find(
                    (value) =>
                        Number(value.id) ===
                        Number(item.member_id)
                );

            if (!member) {
                throw new Error(
                    "Invalid member in percentage split"
                );
            }

            const percentage =
                validateNonNegativeNumber(
                    item.value,
                    "Percentage"
                );

            totalPercentage +=
                percentage;

            return {
                member_id: member.id,
                split_value: percentage,
                share_amount: 0
            };
        }
    );

    if (
        Math.abs(
            totalPercentage - 100
        ) > 0.000001
    ) {
        throw new Error(
            "Percentage split must total exactly 100"
        );
    }

    let assignedAmount = 0;

    splits.forEach(
        (split,index) => {
            let shareAmount =
                roundAmount(
                    amount *
                    split.split_value /
                    100
                );

            if (
                index ===
                splits.length - 1
            ) {
                shareAmount =
                    roundAmount(
                        amount -
                        assignedAmount
                    );
            }

            split.share_amount =
                shareAmount;

            assignedAmount =
                roundAmount(
                    assignedAmount +
                    shareAmount
                );
        }
    );

    return splits;
}

function calculateRatioSplits(
    amount,
    members,
    values
) {
    if (!Array.isArray(values)) {
        throw new Error(
            "Ratio split data is required"
        );
    }

    if (values.length !== members.length) {
        throw new Error(
            "Ratio split must include every group member"
        );
    }

    let totalRatio = 0;

    const splits = values.map(
        (item) => {
            const member =
                members.find(
                    (value) =>
                        Number(value.id) ===
                        Number(item.member_id)
                );

            if (!member) {
                throw new Error(
                    "Invalid member in ratio split"
                );
            }

            const ratio =
                validateNonNegativeNumber(
                    item.value,
                    "Ratio"
                );

            totalRatio += ratio;

            return {
                member_id: member.id,
                split_value: ratio,
                share_amount: 0
            };
        }
    );

    if (totalRatio <= 0) {
        throw new Error(
            "Ratio total must be greater than zero"
        );
    }

    let assignedAmount = 0;

    splits.forEach(
        (split,index) => {
            let shareAmount =
                roundAmount(
                    amount *
                    split.split_value /
                    totalRatio
                );

            if (
                index ===
                splits.length - 1
            ) {
                shareAmount =
                    roundAmount(
                        amount -
                        assignedAmount
                    );
            }

            split.share_amount =
                shareAmount;

            assignedAmount =
                roundAmount(
                    assignedAmount +
                    shareAmount
                );
        }
    );

    return splits;
}

function calculateCustomSplits(
    amount,
    members,
    values
) {
    if (!Array.isArray(values)) {
        throw new Error(
            "Custom split data is required"
        );
    }

    if (values.length !== members.length) {
        throw new Error(
            "Custom split must include every group member"
        );
    }

    let totalAmount = 0;

    const splits = values.map(
        (item) => {
            const member =
                members.find(
                    (value) =>
                        Number(value.id) ===
                        Number(item.member_id)
                );

            if (!member) {
                throw new Error(
                    "Invalid member in custom split"
                );
            }

            const shareAmount =
                roundAmount(
                    validateNonNegativeNumber(
                        item.value,
                        "Custom amount"
                    )
                );

            totalAmount =
                roundAmount(
                    totalAmount +
                    shareAmount
                );

            return {
                member_id: member.id,
                split_value: shareAmount,
                share_amount: shareAmount
            };
        }
    );

    if (
        Math.abs(
            totalAmount - amount
        ) > 0.01
    ) {
        throw new Error(
            "Custom split amounts must equal the expense amount"
        );
    }

    return splits;
}

async function saveSplits(
    expenseId,
    splits
) {
    await ledgerGroupExpenseSplitRepository
        .removeByExpenseId(expenseId);

    for (const split of splits) {
        await ledgerGroupExpenseSplitRepository
            .create(
                expenseId,
                split.member_id,
                split.split_value,
                split.share_amount
            );
    }

    return ledgerGroupExpenseSplitRepository
        .getByExpenseId(expenseId);
}

async function setSplits(
    accountId,
    groupId,
    expenseId,
    splitType,
    values
) {
    const {
        expense,
        members
    } = await getExpenseAndMembers(
        accountId,
        groupId,
        expenseId
    );

    if (
        Number(expense.added_by_account_id) !==
        Number(accountId)
    ) {
        throw new Error(
            "Only the member who added this expense can edit it."
        );
    }

    const type =
        cleanText(splitType);

    if (
        ![
            "equal",
            "percentage",
            "ratio",
            "custom"
        ].includes(type)
    ) {
        throw new Error(
            "Split type must be equal, percentage, ratio or custom"
        );
    }

    let splits;

    if (type === "equal") {
        splits =
            calculateEqualSplits(
                Number(expense.amount),
                members
            );
    }

    if (type === "percentage") {
        splits =
            calculatePercentageSplits(
                Number(expense.amount),
                members,
                values
            );
    }

    if (type === "ratio") {
        splits =
            calculateRatioSplits(
                Number(expense.amount),
                members,
                values
            );
    }

    if (type === "custom") {
        splits =
            calculateCustomSplits(
                Number(expense.amount),
                members,
                values
            );
    }

    const savedSplits =

        await saveSplits(

            expenseId,

            splits

        );

    const recipientAccountIds =

        savedSplits

            .filter(

                split =>

                    Number(split.share_amount) > 0 &&

                    Number(split.account_id) > 0

            )

            .map(

                split =>

                    Number(split.account_id)

            );

    await ledgerNotificationService.sendToAccounts(

        recipientAccountIds,

        "Group Expense",

        `${expense.description} - ₹${Number(expense.amount).toFixed(2)}`,

        {

            type: "ledger_group_expense",

            groupId: String(groupId),

            expenseId: String(expenseId)

        }

    );

    return savedSplits;
}

async function getSplits(
    accountId,
    groupId,
    expenseId
) {
    await getExpenseAndMembers(
        accountId,
        groupId,
        expenseId
    );

    return ledgerGroupExpenseSplitRepository
        .getByExpenseId(expenseId);
}

module.exports = {
    setSplits,
    getSplits
};
