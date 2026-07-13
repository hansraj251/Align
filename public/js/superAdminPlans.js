async function loadPlans() {

    const token =
        SuperAdminAuth.token();

    const response =
        await fetch(

            "/api/super-admin/plans",

            {
                headers: {
                    Authorization:
                        `Bearer ${token}`
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

    renderPlans(
        data.plans
    );

}
function renderPlans(plans) {

    const tbody =
        document.getElementById(
            "plansTable"
        );

    tbody.innerHTML = "";

    plans.forEach(plan => {

        tbody.innerHTML += `

<tr class="border-t">

<td class="p-4 font-semibold">

${plan.display_name}

</td>

<td class="p-4">

${plan.description || "-"}

</td>

<td class="p-4">

${plan.waiter_devices == -1
    ? "Unlimited"
    : plan.waiter_devices}

</td>

<td class="p-4">

<span class="rounded-full px-3 py-1 text-sm
${plan.status === "active"
    ? "bg-green-100 text-green-700"
    : "bg-red-100 text-red-700"}">

${plan.status}

</span>

</td>

<td class="p-4">

<button

onclick="editPlan(${plan.id})"

class="rounded bg-blue-600 px-3 py-2 text-white hover:bg-blue-700">

Edit

</button>

</td>

</tr>

`;

    });

}
function editPlan(planId) {

    alert(
        "Edit Plan : " +
        planId
    );

}