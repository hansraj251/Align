let currentSubscription =
    null;
async function loadSubscription() {

    const data =
        await API.get(
            "/api/subscription"
        );

    if (!data.success) {

    if (data.success) {

    Notify.success(
        data.message
    );

} else {

    Notify.error(
        data.message
    );

}

    return;

}

currentSubscription =
    data.subscription;

renderSubscription(
    data.subscription
);

}

function renderSubscription(subscription) {

    const remainingDays =
    getRemainingDays(
        subscription.plan_end
    );
    const status =
    (
        subscription.subscription_status ||
        ""
    ).toLowerCase();

    let remainingText = "";

switch (
    status
) {

    case "expired":

        remainingText =
            "Expired";

        break;

    case "suspended":

        remainingText =
            "Suspended";

        break;

    default:

        if (remainingDays > 1) {

            remainingText =
                remainingDays +
                " Days";

        } else if (
            remainingDays === 1
        ) {

            remainingText =
                "1 Day";

        } else if (
            remainingDays === 0
        ) {

            remainingText =
                "Today";

        } else {

            remainingText =
                "Expired";

        }

}

    let badgeClass =
    "bg-green-100 text-green-700";

if (
    status ===
    "trial"
) {

    badgeClass =
        "bg-yellow-100 text-yellow-700";

}

if (
    status ===
    "expired"
) {

    badgeClass =
        "bg-red-100 text-red-700";

}
if (
    status ===
    "suspended"
) {

    badgeClass =
        "bg-orange-100 text-orange-700";
        

}

    
    const card =
        document.getElementById(
            "subscriptionCard"
        );

let buttonText =
    "Manage Subscription";

if (
    status === "expired"
) {

    buttonText =
        "Renew Subscription";

}

let showUpgradeButton = true;

if (
    status === "suspended"
) {

    showUpgradeButton = false;

}
  

    card.innerHTML = `

<div class="grid gap-6 md:grid-cols-2">

<div>

<p class="text-sm text-slate-500">

Current Plan

</p>

<p class="mt-2 text-2xl font-bold">

${subscription.display_name}

</p>

</div>

<div>

<p class="text-sm text-slate-500">

Status

</p>

<p class="mt-2">

<span
class="rounded-full px-3 py-1 ${badgeClass}">

${
    status.charAt(0).toUpperCase() +
    status.slice(1)
}

</span>

</p>

</div>

${
    status === "suspended"
        ? `

<div class="md:col-span-2 rounded-xl bg-orange-50 p-4 text-orange-700">

This restaurant has been suspended.

Please contact Align Support for assistance.

</div>

`
        : ""
}

${
    status === "trial" ||
    status === "active"
        ? `

<div>

<p class="text-sm text-slate-500">

Plan Start

</p>

<p class="mt-2">

${formatDate(subscription.plan_start)}

</p>

</div>

<div>

<p class="text-sm text-slate-500">

Plan End

</p>

<p class="mt-2">

${formatDate(subscription.plan_end)}

</p>

</div>

<div>

<p class="text-sm text-slate-500">

Days Remaining

</p>

<p class="mt-2 text-xl font-bold">

${remainingText}

</p>

</div>

<div id="allowedDevicesSection">

<p class="text-sm text-slate-500">

Allowed Devices

</p>

<p class="mt-2 text-xl font-semibold">

${
    subscription.allowed_devices === -1
        ? "Unlimited"
        : subscription.allowed_devices
}

</p>

</div>

<div id="activeDevicesSection">

<p class="text-sm text-slate-500">

Active Devices

</p>

<p class="mt-2 text-xl font-semibold">

${subscription.active_devices}

</p>

</div>

`
        : ""
}

</div>

${
    showUpgradeButton
        ? `

<div class="mt-10">

<button

onclick="upgradePlan()"

class="rounded-xl bg-blue-600 px-6 py-3 text-white hover:bg-blue-700">

${buttonText}

</button>

</div>

`
        : ""
}

`;

}

function upgradePlan() {

    if (
        currentSubscription.plan_id === 2
    ) {

        SubscriptionPayment.renew(
            currentSubscription
        );

        return;

    }

    SubscriptionPayment.upgrade(
        currentSubscription
    );

}

function getRemainingDays(
    endDate
) {

    const today =
        new Date();

    const end =
        new Date(endDate);

    today.setHours(
        0,
        0,
        0,
        0
    );

    end.setHours(
        0,
        0,
        0,
        0
    );

    const diff =
        Math.ceil(
            (
                end - today
            ) / 86400000
        );

    return diff;

}

function formatDate(date) {

    return new Date(date)
        .toLocaleDateString(

            "en-IN",

            {

                day: "2-digit",

                month: "short",

                year: "numeric"

            }

        );

}
loadSubscription();