StaffAuth.requireLogin();

const params =
    new URLSearchParams(
        window.location.search
    );

const areaId =
    params.get("area");

async function loadTables() {

    const data =
        await API.get(
            "/api/tables"
        );

    if (!data.success) {

        Toast.show(
            data.message,
            "error"
        );

        return;

    }

    const tables = data.tables.filter(
    table => table.area_id == areaId
);

renderTables(tables);
if (tables.length) {

    document.getElementById(
        "areaName"
    ).textContent =
        tables[0].area_name || "Tables";

}

}

function renderTables(
    tables
) {

    const list =
        document.getElementById(
            "tableList"
        );

    list.innerHTML = "";

    if (!tables.length) {

        list.innerHTML = `

<div class="col-span-full rounded-xl bg-white p-8 text-center">

No Tables

</div>

`;

        return;

    }

    tables.forEach(table => {
         let icon = "🟢";

    if (table.status === "occupied") {

        icon = "🔴";

    }

    else if (table.status === "ready") {

        icon = "🟡";

    }

    else if (table.status === "billing") {

        icon = "🔵";

    }

        list.innerHTML += `

<div

onclick="openTable(${table.id})"

class="cursor-pointer rounded-xl bg-white p-6 shadow hover:shadow-xl">

<div class="flex items-center justify-between">

<h2 class="text-2xl font-bold">

${table.name}

</h2>

<span>

${icon}

</span>

</div>

<p class="mt-3 text-slate-500">

${table.status}

</p>

</div>

`;

    });

}

function openTable(tableId) {

    window.location.href =
        `/waiter/order.html?table=${tableId}`;

}
setInterval(

    loadTables,

    5000

);

loadTables();