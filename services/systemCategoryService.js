const repository =
    require("../repositories/systemCategoryRepository");

exports.search =
async (keyword) => {

    return {

        success: true,

        categories:

            await repository.search(
                keyword
            )

    };

};