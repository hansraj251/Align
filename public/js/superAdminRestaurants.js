async function loadRestaurants() {

    const token =
        SuperAdminAuth.token();

    if (!token) {

        location.href =
            "/super-admin/login.html";

        return;

    }

    try {

        const response =
            await fetch(
                "/api/super-admin/restaurants",
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

        const tbody =
            document.getElementById(
                "restaurantTable"
            );

        tbody.innerHTML = "";

        data.restaurants.forEach(r => {

            tbody.innerHTML += `

<tr class="border-t">

    <td class="p-4">
        ${r.restaurant_code}
    </td>

    <td class="p-4">
        ${r.name}
    </td>

    <td class="p-4">
        ${r.owner_name}
    </td>

    <td class="p-4">
        ${r.plan}
    </td>

    <td class="p-4">
        ${r.subscription_status}
    </td>

   <td class="p-4">

    <button

        onclick="openActiveDevices(${r.id})"

        class="rounded-full px-3 py-1 text-sm font-semibold
        ${
            r.active_devices > 0
                ? "bg-green-100 text-green-700"
                : "bg-slate-200 text-slate-600"
        }">

        ${r.active_devices} Active

    </button>

</td>

<td class="p-4">

    <button

        onclick="location.href='/super-admin/restaurant.html?id=${r.id}'"

        class="rounded bg-blue-600 px-3 py-2 text-white hover:bg-blue-700">

        Manage

    </button>

</td>

</tr>

`;

        });

    } catch (err) {

        console.error(err);

    }

}
function openActiveDevices(restaurantId) {

    location.href =
        "/super-admin/active-devices.html?restaurant=" +
        restaurantId;

}