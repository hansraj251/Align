const repository =
    require("../repositories/categorySearchRepository");

exports.search = async (
    restaurantId,
    keyword
) => {

    return {

        success: true,

        categories:
            await repository.search(
                restaurantId,
                keyword
            )

    };

};