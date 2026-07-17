Auth.requireLogin();

const staff = JSON.parse(
    localStorage.getItem("staff") || "{}"
);

async function loadAreas() {

    const data =
        await API.get(
            "/api/dining-areas"
        );

    if (!data.success) {

        Toast.show(
            data.message,
            "error"
        );

        return;

    }

    const visibleAreas =
        data.areas.filter(
            area => area.system_key !== "takeaway"
        );

    renderAreas(
        visibleAreas
    );

}

function renderAreas(
    areas
) {

    const container =
        document.getElementById(
            "areaList"
        );

    container.innerHTML = "";

    if (
        areas.length === 0
    ) {

        container.innerHTML = `

<div
class="rounded-xl bg-white p-10 text-center">

No Dining Areas

</div>

`;

        return;

    }

    areas.forEach(area => {

        container.innerHTML += `

<div

onclick="openArea(${area.id})"

class="cursor-pointer rounded-xl bg-white p-6 shadow transition hover:shadow-xl">

<h2
class="mt-4 text-2xl font-bold">

${area.name}

</h2>

<div class="mt-4 space-y-1 text-sm text-slate-600">

<div>

🍽 ${area.total_tables} Tables

</div>

<div>

🔴 ${area.occupied_tables} Occupied

</div>

<div>

🟢 ${area.available_tables} Available

</div>

</div>

<p class="mt-4 font-medium text-green-600">

Tap to View Tables →

</p>

</div>

`;

    });

}
function openArea(areaId) {

    window.location.href =
        `/waiter/tables.html?area=${areaId}`;

}
document.getElementById("pageTitle").textContent =
    localStorage.getItem("restaurantName") || "Dashboard";

loadAreas();

setInterval(

    loadAreas,

    5000

);
