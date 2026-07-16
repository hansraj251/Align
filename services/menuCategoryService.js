const menuCategoryRepository =
    require("../repositories/menuCategoryRepository");

exports.createCategory = async (
    restaurantId,
    name,
    description
) => {

    const categoryId =
        await menuCategoryRepository.createCategory(
            restaurantId,
            name,
            description
        );

    return {

        success: true,

        message:
            "Category created successfully",

        categoryId

    };

};

exports.getCategories = async (
    restaurantId
) => {

    return await menuCategoryRepository.getCategories(
        restaurantId
    );

};

exports.updateCategory = async (
    restaurantId,
    categoryId,
    name,
    description
) => {

    const changes =
        await menuCategoryRepository.updateCategory(
            restaurantId,
            categoryId,
            name,
            description
        );

    if (!changes) {

        throw new Error(
            "Category not found"
        );

    }

    return {

        success: true,

        message:
            "Category updated successfully"

    };

};

exports.deleteCategory = async (
    restaurantId,
    categoryId
) => {

    try
    {

        const changes =
            await menuCategoryRepository.deleteCategory(
                restaurantId,
                categoryId
            );

        if (!changes)
        {

            throw new Error(
                "Category not found"
            );

        }

        return {

            success: true,

            message:
                "Category deleted successfully"

        };

    }
    catch (error)
    {

        if (
            error.message.includes(
                "FOREIGN KEY constraint failed"
            )
        )
        {

            throw new Error(
                "This category cannot be deleted because it is assigned to one or more menu items."
            );

        }

        throw error;

    }

};