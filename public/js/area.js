if (!API.getToken()) {

    window.location.href =
        "/admin/login.html";

}

const params =
    new URLSearchParams(
        window.location.search
    );

const areaId =
    Number(
        params.get("id")
    );

async function loadArea() {

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

        Toast.show(
            "Unable to load area",
            "error"
        );

        return;

    }

    const area =
        areaResponse.areas.find(
            a => a.id == areaId
        );

    if (!area) {

        Toast.show(
            "Area not found",
            "error"
        );

        return;

    }

    document
        .getElementById(
            "areaTitle"
        )
        .textContent =
        area.name;

    document
        .getElementById(
            "areaSubtitle"
        )
        .textContent =
        `${tableResponse.tables.filter(
            t => t.area_id == areaId
        ).length} Tables`;
        renderRows(
    tableResponse.tables
);

}
function renderRows(
    tables
) {

    const container =
        document.getElementById(
            "areaRows"
        );

    container.innerHTML = "";

    const areaTables =
        tables.filter(
            t => t.area_id == areaId
        );

    const maxRow =
        Math.max(
            1,
            ...areaTables.map(
                t => t.display_row || 1
            )
        );

    for (
        let row = 1;
        row <= maxRow;
        row++
    ) {

        const rowTables =
            areaTables.filter(
                t =>
                    (t.display_row || 1) === row
            );

        container.innerHTML += `

<div class="mb-8">

<h2 class="mb-4 text-xl font-bold">

Row ${row}

</h2>

<div class="flex gap-4 overflow-x-auto">

${

rowTables.length

? rowTables.map(table => `

<div
class="min-w-[220px] rounded-xl border bg-white p-5 shadow">

<div class="flex items-center justify-between">

<h3 class="text-lg font-bold">

 ${table.name}

</h3>

<span class="${
    table.status === "available"
        ? "text-green-600"
        : "text-red-600"
}">

${
    table.status === "available"
        ? " Available"
        : " Occupied"
}

</span>

</div>

<p class="mt-3 text-slate-500">

👥 ${table.capacity} Seats

</p>

${
table.status !== "available"

? `

<div class="mt-3 rounded-lg bg-slate-50 p-3">

<div class="flex justify-between">

<span> Items</span>

<strong>${table.total_items}</strong>

</div>

<div class="mt-2 flex justify-between">

<span>₹ Total</span>

<strong>₹${Number(table.total || 0).toFixed(0)}</strong>

</div>

</div>

`

: ""

}

<button
onclick="openDashboardOrder(${table.id})"
class="mt-4 w-full rounded-lg ${
table.status === "available"
? "bg-blue-600"
: "bg-orange-600"
} py-2 text-white">

${
table.status === "available"
? "Open Order"
: "Resume Order"
}

</button>

</div>

`).join("")

: `<p class="text-slate-500">

No tables

</p>`

}

</div>

</div>

`;

    }

}
function openDashboardOrder(
    tableId
) {

    window.location.href =
        `/admin/order.html?table=${tableId}`;

}
loadArea();