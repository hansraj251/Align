const settingsRepository =
    require("../repositories/settingsRepository");

exports.getSettings = async (
    restaurantId
) => {

    let settings =
        await settingsRepository.getSettings(
            restaurantId
        );

    if (!settings) {

        settings = {

            restaurant_name: "",
            address: "",
            phone: "",
            email: "",
            gst_number: "",
            footer_message: "Thank You! Visit Again.",
            cgst: 2.5,
            sgst: 2.5

        };

    }

    return {
        success: true,
        settings
    };

};

exports.saveSettings = async (
    restaurantId,
    body
) => {

    await settingsRepository.saveSettings(
        restaurantId,
        body
    );

    return {
        success: true,
        message: "Settings saved successfully"
    };

};