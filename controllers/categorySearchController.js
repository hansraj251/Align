const service =
    require("../services/categorySearchService");

exports.search = async (
    req,
    res
) => {

    res.json(

        await service.search(
    req.user.restaurantId,
    req.query.keyword || req.query.q || ""

        )

    );

};