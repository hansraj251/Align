const service =
    require("../services/orderItemService");

exports.updateStatus =
async (
    req,
    res
) => {

    try {

        const result =
            await service.updateStatus(

                req.user.restaurantId,

                req.params.id,

                req.body.status

            );

        res.json(result);

    }

    catch (err) {
console.error(err);
        res.status(400).json({

            success: false,

            message: err.message

        });

    }

};

exports.getItems =
async (
    req,
    res
) => {

    try {

        const result =
            await service.getItems(

                req.user.restaurantId,

                req.params.orderId

            );

        res.json(result);

    }

    catch (err) {

        res.status(400).json({

            success: false,

            message: err.message

        });

    }

};
exports.getKitchenItems =
async (req,res)=>{

    try{

        res.json(

            await service.getKitchenItems(

                req.user.restaurantId

            )

        );

    }

    catch(err){

        res.status(400).json({

            success:false,

            message:err.message

        });

    }

};

exports.getReadyItems =
async (req,res)=>{

    try{

        res.json(

            await service.getReadyItems(

                req.user.restaurantId

            )

        );

    }

    catch(err){

        res.status(400).json({

            success:false,

            message:err.message

        });

    }

};