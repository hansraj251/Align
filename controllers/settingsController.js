const settingsService =
    require("../services/settingsService");

exports.getSettings = async (req, res) => {

    try {

        const result =
            await settingsService.getSettings(
                req.user.restaurantId
            );

        res.json(result);

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

};

exports.saveSettings = async (req, res) => {

    try {

        const result =
            await settingsService.saveSettings(
                req.user.restaurantId,
                req.body
            );

        res.json(result);

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

};