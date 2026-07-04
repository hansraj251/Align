let floorAreas = [];
let floorTables = [];
Auth.requireLogin();

async function loadDashboard() {

    const data = await API.get("/api/dashboard");

    if (!data.success) {
        Toast.show(data.message || "Unable to load dashboard", "error");
        return;
    }

    document.getElementById("todaySales").textContent =
        `${Align.formatCurrency(data.todaySales)}`;


    document.getElementById("menuItemCount").textContent =
        data.menuItems;
    document.getElementById("occupiedTables").textContent =
    `${data.occupiedTables} / ${data.totalTables}`;

    document.getElementById("pendingKitchen").textContent =
    data.pendingKitchen;

    await loadRestaurantFloor();  

}
async function loadRestaurantFloor() {

    const areaResponse =
        await API.get(
            "/api/dining-areas"
        );

    const tableResponse =
        await API.get(
            "/api/tables"
        );

    if (
        !areaResponse.success ||
        !tableResponse.success
    ) {

        return;

    }

    floorAreas =
        areaResponse.areas;

    floorTables =
        tableResponse.tables;

    renderRestaurantFloor();

}
function renderRestaurantFloor() {

    const container =
        document.getElementById(
            "dashboardFloor"
        );

    container.innerHTML = "";
    container.className =
    "grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3";

    floorAreas.forEach(area => {

    const areaTables =
        floorTables.filter(
            table =>
                table.area_id == area.id
        );

    const occupied =
        areaTables.filter(
            table =>
                table.status !== "available"
        ).length;

    container.innerHTML += `

<div
    onclick="openArea(${area.id})"
    class="cursor-pointer rounded-2xl bg-white p-6 shadow transition hover:shadow-xl">

    <div class="flex items-center justify-between">

        <div>

            <h2 class="text-2xl font-bold">

                 ${area.name}

            </h2>

            <p class="mt-3 text-slate-500">

                 ${areaTables.length} Tables

            </p>

            <p class="mt-1 text-slate-500">

                 ${occupied} Occupied

            </p>

            <p class="mt-1 text-slate-500">

                 ${areaTables.length - occupied} Available

            </p>

        </div>

        <div
            class="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white">

            View

        </div>

    </div>

</div>

`;

});

}
function openDashboardOrder(tableId) {

    window.location.href =

        `/admin/order.html?table=${tableId}`;

}
function openArea(areaId) {

    window.location.href =
        `/admin/area.html?id=${areaId}`;

}
function formatDuration(minutes) {

    minutes = Number(minutes || 0);

    if (minutes < 60) {

        return `${minutes} min`;

    }

    const hours =
        Math.floor(minutes / 60);

    const mins =
        minutes % 60;

    return `${hours}h ${mins}m`;

}
loadDashboard();