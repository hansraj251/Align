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

            alert(data.message);

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
            class="rounded bg-blue-600 px-3 py-2 text-white">

            View

        </button>

    </td>

</tr>

`;

        });

    } catch (err) {

        console.error(err);

    }

}