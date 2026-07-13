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

renderSubscription(
    data.subscription
);

}

function renderSubscription(subscription) {

    const remainingDays =
    getRemainingDays(
        subscription.plan_end
    );

    let badgeClass =
    "bg-green-100 text-green-700";

if (
    subscription.subscription_status ===
    "Trial"
) {

    badgeClass =
        "bg-yellow-100 text-yellow-700";

}

if (
    subscription.subscription_status ===
    "Expired"
) {

    badgeClass =
        "bg-red-100 text-red-700";

}
    
    const card =
        document.getElementById(
            "subscriptionCard"
        );

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
    subscription.subscription_status
        .charAt(0)
        .toUpperCase()

    +

    subscription.subscription_status
        .slice(1)
}

</span>

</p>

</div>

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

${
    remainingDays > 1
        ? remainingDays + " Days"

        : remainingDays === 1
            ? "1 Day"

            : remainingDays === 0
                ? "Today"

                : "Expired"
}

</p>

</div>

<div>

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

<div>

<p class="text-sm text-slate-500">

Active Devices

</p>

<p class="mt-2 text-xl font-semibold">

${subscription.active_devices}

</p>

</div>

</div>

<div class="mt-10">

<button

onclick="upgradePlan()"

class="rounded-xl bg-blue-600 px-6 py-3 text-white hover:bg-blue-700">

Upgrade to Pro

</button>

</div>

`;

}
function upgradePlan() {

    alert(
        "Upgrade feature will be available soon."
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