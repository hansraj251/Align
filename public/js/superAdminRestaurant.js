let plans = [];
function getRestaurantId() {

    return new URLSearchParams(
        location.search
    ).get("id");

}

async function loadRestaurant() {

    await loadPlans();

    const id =
        getRestaurantId();

    const response =
        await fetch(

            `/api/super-admin/restaurants/${id}`,

            {

                headers: {

                    Authorization:

                        "Bearer " +

                        SuperAdminAuth.token()

                }

            }

        );

    const data =
        await response.json();

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

    renderRestaurant(
        data.restaurant
    );

}
function renderRestaurant(
    restaurant
) {
const remainingDays =
    Math.ceil(
        (
            new Date(restaurant.plan_end) -
            new Date()
        ) / 86400000
    ); 

    document.getElementById(
        "restaurantContent"
    ).innerHTML = `

<div class="space-y-8">

<div class="rounded-2xl bg-white p-8 shadow">

<h2 class="mb-6 text-2xl font-bold">

Restaurant Information

</h2>

<div class="grid gap-6 md:grid-cols-2">

<div>

<p class="text-sm text-slate-500">

Restaurant

</p>

<p class="font-semibold">

${restaurant.name}

</p>

</div>

<div>

<p class="text-sm text-slate-500">

Owner

</p>

<p class="font-semibold">

${restaurant.owner_name}

</p>

</div>

<div>

<p class="text-sm text-slate-500">

Mobile

</p>

<p>

${restaurant.mobile}

</p>

</div>

<div>

<p class="text-sm text-slate-500">

Email

</p>

<p>

${restaurant.email}

</p>

</div>

</div>

</div>

<div class="rounded-2xl bg-white p-8 shadow">

<h2 class="mb-6 text-2xl font-bold">

Subscription

</h2>

<div class="grid gap-6 md:grid-cols-2">

<div>

<p class="text-sm text-slate-500">

Current Plan

</p>

<select
    id="planSelect"
    class="mt-2 w-full rounded-lg border border-slate-300 p-3">

${plans.map(plan => `

<option

value="${plan.id}"

${plan.id == restaurant.plan_id ? "selected" : ""}>

${plan.display_name}

</option>

`).join("")}

</select>

</div>

<div>

<p class="text-sm text-slate-500">

Status

</p>

<select
    id="statusSelect"
    class="mt-2 w-full rounded-lg border border-slate-300 p-3">

<option
value="trial"
${restaurant.subscription_status==="trial"?"selected":""}>

Trial

</option>

<option
value="active"
${restaurant.subscription_status==="active"?"selected":""}>

Active

</option>

<option
value="expired"
${restaurant.subscription_status==="expired"?"selected":""}>

Expired

</option>

<option
value="suspended"
${restaurant.subscription_status==="suspended"?"selected":""}>

Suspended

</option>

</select>

</div>

<div>

<p class="text-sm text-slate-500">

Plan Start

</p>

<p>

${restaurant.plan_start}

</p>

</div>

<div>

<p class="text-sm text-slate-500">

Plan End

</p>

<p>

${restaurant.plan_end}

</p>

</div>

<div>

<p class="text-sm text-slate-500">

Validity (Days)

</p>

<input

id="daysInput"

type="number"

value="${remainingDays}"

min="1"

class="mt-2 w-full rounded-lg border border-slate-300 p-3">

</div>

<div>

<p class="text-sm text-slate-500">

Device Usage

</p>

<p class="text-lg font-semibold">

${restaurant.active_devices}
/

${
    restaurant.allowed_devices < 0 ||
    restaurant.allowed_devices >= 999
        ? "Unlimited"
        : restaurant.allowed_devices
}

</p>

</div>

</div>

<div class="mt-8">

<button

onclick="saveSubscription()"

class="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700">

Save Subscription

</button>

</div>
</div>

</div>

`;

}
async function loadPlans() {

    const response =
        await fetch(

            "/api/super-admin/plans",

            {

                headers: {

                    Authorization:
                        "Bearer " +
                        SuperAdminAuth.token()

                }

            }

        );

    const data =
        await response.json();

    if (data.success) {

        plans =
            data.plans;

    }

}
async function saveSubscription() {

    const id =
        getRestaurantId();

    const response =
        await fetch(

            `/api/super-admin/restaurants/${id}/subscription`,

            {

                method: "PUT",

                headers: {

                    "Content-Type":
                        "application/json",

                    Authorization:
                        "Bearer " +
                        SuperAdminAuth.token()

                },

                body: JSON.stringify({

                    plan_id:
                        document.getElementById(
                            "planSelect"
                        ).value,

                    subscription_status:
                        document.getElementById(
                            "statusSelect"
                        ).value,

                    days:
                        Number(

                            document.getElementById(
                                "daysInput"
                            ).value

                        )

                })

            }

        );

    const data =
        await response.json();

    if (data.success) {

    Notify.success(
        data.message
    );

    loadRestaurant();

} else {

    Notify.error(
        data.message
    );

}

}