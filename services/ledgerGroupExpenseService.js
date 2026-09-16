const ledgerGroupExpenseRepository =

    require("../repositories/ledgerGroupExpenseRepository");

const ledgerGroupMemberRepository =

    require("../repositories/ledgerGroupMemberRepository");

function cleanText(

    value

) {

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

function validateDescription(

    description

) {

    const cleanedDescription =

        cleanText(description);

    if (!cleanedDescription) {

        throw new Error(

            "Expense description is required"

        );

    }

    if (

        cleanedDescription.length > 255

    ) {

        throw new Error(

            "Expense description must not exceed 255 characters"

        );

    }

    return cleanedDescription;

}

function validateAmount(

    amount

) {

    if (

        amount === undefined ||

        amount === null ||

        amount === ""

    ) {

        throw new Error(

            "Expense amount is required"

        );

    }

    const numericAmount =

        Number(amount);

    if (

        !Number.isFinite(numericAmount) ||

        numericAmount <= 0

    ) {

        throw new Error(

            "Expense amount must be a valid positive amount"

        );

    }

    return numericAmount;

}

function validateExpenseDate(

    expenseDate

) {

    const cleanedDate =

        cleanText(expenseDate);

    if (!cleanedDate) {

        return new Date()

            .toISOString()

            .slice(0, 10);

    }

    if (

        !/^\d{4}-\d{2}-\d{2}$/

            .test(cleanedDate)

    ) {

        throw new Error(

            "Expense date must be in YYYY-MM-DD format"

        );

    }

    const date =

        new Date(

            `${cleanedDate}T00:00:00`

        );

    if (

        Number.isNaN(

            date.getTime()

        )

    ) {

        throw new Error(

            "Expense date is invalid"

        );

    }

    return cleanedDate;

}

function validateSplitType(

    splitType

) {

    const type =

        cleanText(splitType) ||

        "equal";

    const allowedTypes = [

        "equal",

        "percentage",

        "ratio",

        "custom"

    ];

    if (

        !allowedTypes.includes(type)

    ) {

        throw new Error(

            "Split type must be equal, percentage, ratio or custom"

        );

    }

    return type;

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

async function getExpenses(

    accountId,

    groupId

) {

    await requireActiveMember(

        accountId,

        groupId

    );

    return ledgerGroupExpenseRepository

        .getByGroupId(

            groupId

        );

}

async function getExpense(

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

    return expense;

}

async function createExpense(

    accountId,

    groupId,

    description,

    amount,

    expenseDate,

    splitType,

    notes

) {

    await requireActiveMember(

        accountId,

        groupId

    );

    const cleanedDescription =

        validateDescription(

            description

        );

    const validatedAmount =

        validateAmount(

            amount

        );

    const validatedDate =

        validateExpenseDate(

            expenseDate

        );

    const validatedSplitType =

        validateSplitType(

            splitType

        );

    const cleanedNotes =

        cleanText(notes);

    if (

        cleanedNotes &&

        cleanedNotes.length > 1000

    ) {

        throw new Error(

            "Expense notes must not exceed 1000 characters"

        );

    }

    return ledgerGroupExpenseRepository

        .create(

            groupId,

            accountId,

            cleanedDescription,

            validatedAmount,

            validatedDate,

            validatedSplitType,

            cleanedNotes

        );

}

async function updateExpense(

    accountId,

    groupId,

    expenseId,

    description,

    amount,

    expenseDate,

    splitType,

    notes

) {

    await requireActiveMember(

        accountId,

        groupId

    );

    const existingExpense =

        await ledgerGroupExpenseRepository

            .getById(

                expenseId,

                groupId

            );

    if (!existingExpense) {

        throw new Error(

            "Group expense not found"

        );

    }

    const cleanedDescription =

        validateDescription(

            description

        );

    const validatedAmount =

        validateAmount(

            amount

        );

    const validatedDate =

        validateExpenseDate(

            expenseDate

        );

    const validatedSplitType =

        validateSplitType(

            splitType

        );

    const cleanedNotes =

        cleanText(notes);

    if (

        cleanedNotes &&

        cleanedNotes.length > 1000

    ) {

        throw new Error(

            "Expense notes must not exceed 1000 characters"

        );

    }

    return ledgerGroupExpenseRepository

        .update(

            expenseId,

            groupId,

            cleanedDescription,

            validatedAmount,

            validatedDate,

            validatedSplitType,

            cleanedNotes

        );

}

async function deleteExpense(

    accountId,

    groupId,

    expenseId

) {

    await requireActiveMember(

        accountId,

        groupId

    );

    const existingExpense =

        await ledgerGroupExpenseRepository

            .getById(

                expenseId,

                groupId

            );

    if (!existingExpense) {

        throw new Error(

            "Group expense not found"

        );

    }

    await ledgerGroupExpenseRepository

        .remove(

            expenseId,

            groupId

        );

}

module.exports = {

    getExpenses,

    getExpense,

    createExpense,

    updateExpense,

    deleteExpense

};
