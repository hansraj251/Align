const service =
    require("../services/systemCategoryService");

exports.search =
async (req,res)=>{

    res.json(

        await service.search(

            req.query.q || ""

        )

    );

};