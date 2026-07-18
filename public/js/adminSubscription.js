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

    status === "expired" ||

    subscription.is_highest_plan

) {

    buttonText =
        "Renew Subscription";

}

if (
    status === "suspended"
) {

    buttonText =
        "Contact Administrator";

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

<div
id="activeDevicesSection"
class="cursor-pointer rounded-xl p-3 transition hover:bg-slate-100"
onclick="showActiveDevices()">

<div class="flex items-center justify-between">

<div>

<p class="text-sm text-slate-500">

Active Devices

</p>

<p class="mt-2 text-xl font-semibold">

${subscription.active_devices}

</p>

</div>

<div class="text-2xl text-slate-400">

›

</div>

</div>

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

    SubscriptionPayment.open(
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
async function showActiveDevices() {

    const data =
        await API.get(
            "/api/subscription/active-devices"
        );

    if (
        !data.success
    ) {

        return;

    }

    const modal =
        document.getElementById(
            "activeDevicesModal"
        );

    const list =
        document.getElementById(
            "activeDevicesList"
        );

    list.innerHTML =
        "";

        if (
    data.sessions.length === 0
) {

    closeActiveDevicesModal();

    return;

}

    data.sessions.forEach(
        session => {

            list.innerHTML += `

<div class="border rounded-lg p-4 flex justify-between items-center">

    <div>

        <div class="font-semibold">
            ${session.staff_name}
        </div>

        <div class="text-sm text-gray-500">
            ${session.role}
        </div>

        <div class="text-xs text-gray-400 mt-1">
            ${getDeviceName(session.device_info)}
        </div>

        <div class="text-xs text-gray-400">
            Last Seen:
            ${Align.formatDateTime(session.last_seen)}
        </div>

    </div>

    <button
        onclick="logoutActiveDevice(${session.id})"
        class="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
    >
        Logout
    </button>

</div>

`;

        }
    );

    modal.classList.remove(
        "hidden"
    );

    modal.classList.add(
        "flex"
    );

}
function closeActiveDevicesModal() {

    document
        .getElementById(
            "activeDevicesModal"
        )
        .classList
        .add(
            "hidden"
        );

}
async function logoutActiveDevice(sessionId) {

    Modal.confirm(

        "Logout Device",

        "Are you sure you want to logout this device?",

        async () => {

            const data =
                await API.post(
                    `/api/subscription/active-devices/${sessionId}/logout`
                );

            if (!data.success) {

                throw new Error(
                    data.message
                );

            }

            Modal.close();

            await showActiveDevices();

            loadSubscription();

        },

        {

            buttonText:
                "Logout",

            buttonClass:
                "bg-red-600 hover:bg-red-700",

            loadingText:
                "Logging out..."

        }

    );

}
function getDeviceName(userAgent) {

    if (!userAgent) {

        return "Unknown Device";

    }

    let browser = "Browser";
    let os = "Unknown";

    if (userAgent.includes("Chrome") &&
        !userAgent.includes("Edg")) {

        browser = "Chrome";

    } else if (userAgent.includes("Firefox")) {

        browser = "Firefox";

    } else if (userAgent.includes("Safari") &&
               !userAgent.includes("Chrome")) {

        browser = "Safari";

    } else if (userAgent.includes("Edg")) {

        browser = "Edge";

    }

    if (userAgent.includes("Windows")) {

        os = "Windows";

    } else if (userAgent.includes("Mac")) {

        os = "macOS";

    } else if (userAgent.includes("Android")) {

        os = "Android";

    } else if (
        userAgent.includes("iPhone") ||
        userAgent.includes("iPad")
    ) {

        os = "iPhone";

    } else if (userAgent.includes("Linux")) {

        os = "Linux";

    }

    return `${browser} • ${os}`;

}
let subscriptionRefreshTimer = null;

function startSubscriptionAutoRefresh() {

    if (subscriptionRefreshTimer) {

        clearInterval(
            subscriptionRefreshTimer
        );

    }

    subscriptionRefreshTimer =
        setInterval(
            async () => {

                await loadSubscription();

                const modal =
                    document.getElementById(
                        "activeDevicesModal"
                    );

                if (
                    modal &&
                    !modal.classList.contains(
                        "hidden"
                    )
                ) {

                    await showActiveDevices();

                }

            },
            5000
        );

}
loadSubscription();

startSubscriptionAutoRefresh();