const ledgerGroupInvitationService =

    require("../services/ledgerGroupInvitationService");

exports.getPendingInvitations =

async (

    req,

    res

) => {

    try {

        const invitations =

            await ledgerGroupInvitationService

                .getPendingInvitations(

                    req.alignAccountId

                );

        return res.json({

            success: true,

            invitations

        });

    }

    catch (err) {

        return res.status(500).json({

            success: false,

            message:

                err.message

        });

    }

};

exports.createInvitation =

async (

    req,

    res

) => {

    try {

        const invitation =

            await ledgerGroupInvitationService

                .createInvitation(

                    req.alignAccountId,

                    req.params.id,

                    req.body.email

                );

        return res.status(201).json({

            success: true,

            invitation

        });

    }

    catch (err) {

        return res.status(400).json({

            success: false,

            message:

                err.message

        });

    }

};

exports.respondToInvitation =

async (

    req,

    res

) => {

    try {

        const invitation =

            await ledgerGroupInvitationService

                .respondToInvitation(

                    req.alignAccountId,

                    req.params.id,

                    req.body.status

                );

        return res.json({

            success: true,

            invitation

        });

    }

    catch (err) {

        return res.status(400).json({

            success: false,

            message:

                err.message

        });

    }

};
