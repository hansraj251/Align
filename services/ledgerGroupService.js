const ledgerGroupRepository =
    require("../repositories/ledgerGroupRepository");

const ledgerGroupMemberRepository =
    require("../repositories/ledgerGroupMemberRepository");

const alignAccountRepository =
    require("../repositories/alignAccountRepository");

const ledgerBusinessService =
    require("./ledgerBusinessService");

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

function validateGroupName(
    name
) {
    const cleanedName =
        cleanText(name);

    if (!cleanedName) {
        throw new Error(
            "Group name is required"
        );
    }

    if (
        cleanedName.length > 150
    ) {
        throw new Error(
            "Group name must not exceed 150 characters"
        );
    }

    return cleanedName;
}

async function getGroups(

    accountId

) {

    return ledgerGroupMemberRepository

        .getByAccountId(

            accountId

        );

}

async function getGroup(

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

            "Group not found"

        );

    }

    const group =

        await ledgerGroupRepository

            .getByMemberAccount(

                groupId,

                accountId

            );

    if (!group) {

        throw new Error(

            "Group not found"

        );

    }

    return group;

}

async function createGroup(
    accountId,
    name,
    description
) {
    const business =
        await ledgerBusinessService
            .getBusiness(accountId);

    const account =
        await alignAccountRepository
            .getById(
                accountId
            );

    if (!account) {
        throw new Error(
            "Align account not found"
        );
    }

    const validatedName =
        validateGroupName(name);

    const cleanedDescription =
        cleanText(description);

    const group =
        await ledgerGroupRepository
            .create(
                business.id,
                validatedName,
                cleanedDescription
            );

    await ledgerGroupMemberRepository
        .create(
            group.id,
            account.id,
            account.name,
            account.mobile,
            account.email,
            "owner",
            "active",
            new Date().toISOString()
        );

    return group;
}

async function updateGroup(
    accountId,
    groupId,
    name,
    description
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
            "Group not found"
        );
    }

    if (member.role !== "owner") {
        throw new Error(
            "Only owner can edit this group."
        );
    }

    const business =
        await ledgerBusinessService
            .getBusiness(accountId);

    const existing =
        await ledgerGroupRepository
            .getById(
                groupId,
                business.id
            );

    if (!existing) {
        throw new Error(
            "Group not found"
        );
    }

    const validatedName =
        validateGroupName(name);

    return ledgerGroupRepository
        .update(
            groupId,
            business.id,
            validatedName,
            cleanText(description)
        );
}

async function deactivateGroup(
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
            "Group not found"
        );
    }

    if (member.role !== "owner") {
        throw new Error(
            "Only owner can delete this group."
        );
    }

    const business =
        await ledgerBusinessService
            .getBusiness(accountId);

    const existing =
        await ledgerGroupRepository
            .getById(
                groupId,
                business.id
            );

    if (!existing) {
        throw new Error(
            "Group not found"
        );
    }

    return ledgerGroupRepository
        .deactivate(
            groupId,
            business.id
        );
}

module.exports = {
    getGroups,
    getGroup,
    createGroup,
    updateGroup,
    deactivateGroup
};
