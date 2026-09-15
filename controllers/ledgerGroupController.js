const ledgerGroupService =
    require("../services/ledgerGroupService");

exports.getGroups =

async (

    req,

    res

) => {

    try {

        const groups =

            await ledgerGroupService

                .getGroups(

                    req.alignAccountId

                );

        return res.json({

            success: true,

            groups

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

exports.getGroup =

async (

    req,

    res

) => {

    try {

        const group =

            await ledgerGroupService

                .getGroup(

                    req.alignAccountId,

                    req.params.id

                );

        return res.json({

            success: true,

            group

        });

    }

    catch (err) {

        return res.status(404).json({

            success: false,

            message:

                err.message

        });

    }

};

exports.createGroup =

async (

    req,

    res

) => {

    try {

        const group =

            await ledgerGroupService

                .createGroup(

                    req.alignAccountId,

                    req.body.name,

                    req.body.description

                );

        return res.status(201).json({

            success: true,

            group

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

exports.updateGroup =

async (

    req,

    res

) => {

    try {

        const group =

            await ledgerGroupService

                .updateGroup(

                    req.alignAccountId,

                    req.params.id,

                    req.body.name,

                    req.body.description

                );

        return res.json({

            success: true,

            group

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

exports.deleteGroup =

async (

    req,

    res

) => {

    try {

        const group =

            await ledgerGroupService

                .deactivateGroup(

                    req.alignAccountId,

                    req.params.id

                );

        return res.json({

            success: true,

            group

        });

    }

    catch (err) {

        return res.status(404).json({

            success: false,

            message:

                err.message

        });

    }

};
