const variantRepository =
    require("../repositories/menuVariantRepository");

exports.getVariants = async (
    menuItemId
) => {

    const variants =
        await variantRepository.getVariants(
            menuItemId
        );

    return {

        success: true,

        variants

    };

};
exports.replaceVariants = async (
    menuItemId,
    variants
) => {

    variants = variants.filter(item =>

        item.name &&
        item.name.trim() !== ""

    );

    if (variants.length === 0) {

        throw new Error(
            "At least one variant is required"
        );

    }

    await variantRepository.replaceVariants(

        menuItemId,

        variants

    );

    return {

        success: true,

        message:
            "Variants updated successfully"

    };

};