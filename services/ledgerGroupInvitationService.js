const ledgerGroupInvitationRepository =
    require("../repositories/ledgerGroupInvitationRepository");

const ledgerGroupMemberRepository =
    require("../repositories/ledgerGroupMemberRepository");

const ledgerGroupRepository =
    require("../repositories/ledgerGroupRepository");

const alignAccountRepository =
    require("../repositories/alignAccountRepository");

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

function validateEmail(

    email

) {

    const cleanedEmail =

        cleanText(email);

    if (!cleanedEmail) {

        throw new Error(

            "Email is required"

        );

    }

    if (

        cleanedEmail.length > 255 ||

        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(

            cleanedEmail

        )

    ) {

        throw new Error(

            "Valid email is required"

        );

    }

    return cleanedEmail.toLowerCase();

}

async function getPendingInvitations(

    accountId

) {

    return ledgerGroupInvitationRepository

        .getPendingByAccountId(

            accountId

        );

}

async function createInvitation(

    accountId,

    groupId,

    email

) {

    const inviter =

        await alignAccountRepository

            .getById(

                accountId

            );

    if (

        !inviter ||

        inviter.status !== "active"

    ) {

        throw new Error(

            "Align account not found"

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

    const invitedEmail =

        validateEmail(email);

    const invitedAccount =

        await alignAccountRepository

            .getByEmail(

                invitedEmail

            );

    if (

        !invitedAccount ||

        invitedAccount.status !== "active"

    ) {

        throw new Error(

            "Align account with this email was not found"

        );

    }

    if (

        invitedAccount.id === accountId

    ) {

        throw new Error(

            "You cannot invite yourself"

        );

    }

    const existingMember =

        await ledgerGroupMemberRepository

            .getByGroupAndAccount(

                groupId,

                invitedAccount.id

            );

    if (

        existingMember &&

        existingMember.status === "active"

    ) {

        throw new Error(

            "Account is already a group member"

        );

    }

    const pendingInvitation =

        await ledgerGroupInvitationRepository

            .getPendingByGroupAndAccount(

                groupId,

                invitedAccount.id

            );

    if (pendingInvitation) {

        throw new Error(

            "Invitation is already pending"

        );

    }

    return ledgerGroupInvitationRepository

        .create(

            groupId,

            accountId,

            invitedAccount.id,

            invitedAccount.name,

            invitedAccount.mobile,

            invitedAccount.email

        );

}

async function respondToInvitation(

    accountId,

    invitationId,

    status

) {

    if (

        status !== "accepted" &&

        status !== "rejected"

    ) {

        throw new Error(

            "Invalid invitation response"

        );

    }

    const invitation =

        await ledgerGroupInvitationRepository

            .getById(

                invitationId

            );

    if (

        !invitation ||

        invitation.invited_account_id !== accountId ||

        invitation.status !== "pending"

    ) {

        throw new Error(

            "Invitation not found"

        );

    }

    if (status === "rejected") {

        return ledgerGroupInvitationRepository

            .updateStatus(

                invitationId,

                accountId,

                "rejected"

            );

    }

    const existingMember =

        await ledgerGroupMemberRepository

            .getByGroupAndAccount(

                invitation.group_id,

                accountId

            );

    if (

        existingMember &&

        existingMember.status === "active"

    ) {

        throw new Error(

            "Account is already a group member"

        );

    }

    return ledgerGroupInvitationRepository

        .acceptInvitationAndCreateMember(

            invitationId,

            accountId,

            invitation.group_id,

            invitation.name,

            invitation.mobile,

            invitation.email,

            new Date().toISOString()

        );

}

module.exports = {

    getPendingInvitations,

    createInvitation,

    respondToInvitation

};
