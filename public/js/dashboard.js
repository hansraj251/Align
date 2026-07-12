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
    areaResponse.areas.filter(
        area =>
            area.system_key !== "takeaway"
    );

floorTables =
    tableResponse.tables;

const takeawayBtn =
    document.getElementById(
        "takeawayBtn"
    );

const takeawayResponse =
    await API.get(
        "/api/tables/takeaway"
    );

if (
    takeawayBtn &&
    takeawayResponse.success &&
    takeawayResponse.table
) {

   takeawayBtn.href =
`/admin/area.html?id=${takeawayResponse.table.area_id}`;

}

renderRestaurantFloor();

}
function renderRestaurantFloor() {

    const container =
        document.getElementById(
            "dashboardFloor"
        );

    container.innerHTML = "";
    container.className =
        "grid grid-cols-1 gap-6 pt-2 md:grid-cols-2 xl:grid-cols-3";

    const colors = {

        blue: {
            bg: "bg-blue-50",
            border: "border-blue-200",
            hover: "hover:border-blue-500 hover:bg-blue-100"
        },

        emerald: {
            bg: "bg-emerald-50",
            border: "border-emerald-200",
            hover: "hover:border-emerald-500 hover:bg-emerald-100"
        },

        orange: {
            bg: "bg-orange-50",
            border: "border-orange-200",
            hover: "hover:border-orange-500 hover:bg-orange-100"
        },

        violet: {
            bg: "bg-violet-50",
            border: "border-violet-200",
            hover: "hover:border-violet-500 hover:bg-violet-100"
        },

        rose: {
            bg: "bg-rose-50",
            border: "border-rose-200",
            hover: "hover:border-rose-500 hover:bg-rose-100"
        },

        slate: {
            bg: "bg-slate-100",
            border: "border-slate-300",
            hover: "hover:border-slate-500 hover:bg-slate-200"
        }

    };

    floorAreas.forEach(area => {

        const color =
            colors[area.card_color] ||
            colors.blue;

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
    class="cursor-pointer rounded-2xl border ${color.border} ${color.bg} p-6 shadow-sm transition-all duration-200 ease-out hover:-translate-y-1 hover:scale-[1.02] ${color.hover} hover:shadow-2xl active:scale-[0.99]">

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