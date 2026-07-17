const menuCategoryRepository =
    require("../repositories/menuCategoryRepository");

exports.createCategory = async (
    restaurantId,
    name,
    description
) => {
    const cleanedName =
    name
        .trim()
        .replace(/\s+/g, " ");
     
    const existingCategory =
    await menuCategoryRepository.findByName(
        restaurantId,
        cleanedName
    );

if (existingCategory)
{
    throw new Error(
        "Category already exists."
    );
}
const categoryId =
    await menuCategoryRepository.createCategory(
        restaurantId,
        cleanedName,
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
    const cleanedName =
    name
        .trim()
        .replace(/\s+/g, " ");
    const existingCategory =
    await menuCategoryRepository.findByNameExceptId(
        restaurantId,
        categoryId,
        cleanedName
    );

if (existingCategory)
{
    throw new Error(
        "Category already exists."
    );
}    

    const changes =
        await menuCategoryRepository.updateCategory(
    restaurantId,
    categoryId,
    cleanedName,
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
exports.findByNameExceptId = async (
    restaurantId,
    categoryId,
    name
) => {

    return await db.getAsync(
        `
        SELECT
            id
        FROM menu_categories
        WHERE
            restaurant_id = ?

            AND id != ?

            AND LOWER(
                TRIM(name)
            ) = LOWER(
                TRIM(?)
            )

        LIMIT 1
        `,
        [
            restaurantId,
            categoryId,
            name
        ]
    );

};