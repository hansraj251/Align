async function loadRestaurants() {

    const token =
        SuperAdminAuth.token();

    if (!token) {

        location.href =
            "/login.html";

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

<tr>

    <td class="whitespace-nowrap p-4">

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

            onclick="location.href='/super-admin/restaurant.html?id=${r.id}'"

            class="rounded bg-slate-600 px-3 py-2 text-white hover:bg-blue-700">

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
