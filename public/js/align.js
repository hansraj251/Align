window.Align = window.Align || {};

Align.Order = {};
Align.Waiter = {};
Align.Kitchen = {};
Align.Cashier = {};
Align.Admin = {};

Align.Settings =
    JSON.parse(
        localStorage.getItem("appSettings")
    ) || {

        currency: "INR",

        timeZone: "Asia/Kolkata"

    };

Align.formatCurrency = function (
    amount,
    decimals = 0
) {

    const currency =
        Align.Settings.currency || "INR";

    return new Intl.NumberFormat(
        undefined,
        {
            style: "currency",
            currency,
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }
    ).format(Number(amount || 0));

};