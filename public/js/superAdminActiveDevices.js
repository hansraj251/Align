function getRestaurantId() {

    return new URLSearchParams(
        location.search
    ).get("restaurant");

}

async function loadActiveDevices() {

    const restaurantId =
        getRestaurantId();

    const token =
        SuperAdminAuth.token();

    if (!restaurantId) {

        alert("Restaurant not found");

        return;

    }

    try {

        const response =
            await fetch(

                `/api/super-admin/restaurants/${restaurantId}/active-sessions`,

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

        renderSessions(
            data.sessions
        );

    } catch (err) {

        console.error(err);

    }

}
function renderSessions(
    sessions
) {

    const tbody =
        document.getElementById(
            "sessionTable"
        );

    if (!sessions.length) {

        tbody.innerHTML = `

<tr>

<td
colspan="5"
class="p-8 text-center text-slate-500">

No active devices found.

</td>

</tr>

`;

        return;

    }

    tbody.innerHTML = "";

    sessions.forEach(s => {

        tbody.innerHTML += `

<tr class="border-t">

<td class="p-4">

${s.staff_name}

</td>

<td class="p-4">

${s.role}

</td>

<td class="p-4">

${s.login_at}

</td>

<td class="p-4">

${s.last_seen}

</td>

<td class="p-4">

<button

onclick="forceLogout(${s.id})"

class="rounded bg-red-600 px-3 py-2 text-white hover:bg-red-700">

Force Logout

</button>

</td>

</tr>

`;

    });

}
async function forceLogout(sessionId) {

    if (
        !confirm(
            "Force logout this device?"
        )
    ) {

        return;

    }

    const token =
        SuperAdminAuth.token();

    try {

        const response =
            await fetch(

                `/api/super-admin/sessions/${sessionId}/force-logout`,

                {

                    method: "POST",

                    headers: {

                        Authorization:
                            `Bearer ${token}`

                    }

                }

            );
            console.log(
    "Force logout status:",
    response.status
);

        const data =
            await response.json();
            console.log(
    "Force logout response:",
    data
);

        if (!data.success) {

    Notify.error(
        data.message
    );

    return;

}

Notify.success(
    data.message
);

        await loadActiveDevices();

    } catch (err) {

        console.error(err);

        alert(
            "Unable to logout device."
        );

    }

}