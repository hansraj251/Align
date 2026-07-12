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

    const subtitle =
    document.getElementById(
        "areaSubtitle"
    );

if (
    area.system_key === "takeaway"
) {

    subtitle.textContent = "";

} else {

    subtitle.textContent =
        `${tableResponse.tables.filter(
            t => t.area_id == areaId
        ).length} Tables`;

}

    const areaTables =
    tableResponse.tables.filter(
        t => t.area_id == areaId
    );

if (
    area.system_key === "takeaway"
) {

    const occupied =
        areaTables.filter(
            t => t.status !== "available"
        );

    const available =
        areaTables.filter(
            t => t.status === "available"
        );

    renderRows([
        ...occupied,
        ...(available.length
            ? [available[0]]
            : [])
    ]);

} else {

    renderRows(
        tableResponse.tables
    );

}

return;    
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
    const isTakeAway =
    areaTables.some(
        t => t.system_key === "takeaway"
    );

if (isTakeAway) {

    container.innerHTML = `
<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">

${areaTables.length

? areaTables.map(table => `

<div
onclick="openDashboardOrder(${table.id}, ${table.area_id})"
class="mt-2.5 ml-1 cursor-pointer rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition-all duration-200 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:border-blue-500 hover:bg-blue-50 hover:shadow-2xl active:scale-[0.99] md:rounded-xl md:p-5">

<div class="flex items-center justify-between">

<h3 class="text-base font-bold md:text-lg">

${table.name}

</h3>

<span class="${
    table.status === "available"
        ? "text-green-600"
        : "text-red-600"
}">

${
    table.status === "available"
        ? "Available"
        : "Occupied"
}

</span>

</div>

${
table.status !== "available"
? `
<div class="mt-2 text-sm font-medium text-red-600">

⏱ ${table.minutes ?? 0} min

</div>

<div class="mt-3 rounded-lg bg-slate-50 p-3">

<div class="flex justify-between">

<span>Items</span>

<strong>${table.total_items}</strong>

</div>

<div class="mt-2 flex justify-between">

<span>Total</span>

<strong>${Align.formatCurrency(table.total || 0, 0)}</strong>

</div>

</div>
`
: ""
}

</div>

`).join("")

: `<p class="text-slate-500">No tables</p>`
}

</div>
`;

    return;

}    

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

<div class="flex gap-4 overflow-x-auto">

${

rowTables.length

? rowTables.map(table => `

<div
onclick="openDashboardOrder(${table.id}, ${table.area_id})"
class="mt-2.5 ml-1 flex min-w-[150px] cursor-pointer flex-col rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition-all duration-200 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:border-blue-500 hover:bg-blue-50 hover:shadow-2xl active:scale-[0.99] md:min-w-[220px] md:rounded-xl md:p-5">

<div class="flex items-center justify-between">

<h3 class="text-base font-bold md:text-lg">

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

${
table.system_key === "takeaway"

? ""

: `
<p class="mt-2 text-xs text-slate-500 md:mt-3 md:text-sm">

👥 ${table.capacity} Seats

</p>
`
}

${
table.status !== "available"

? `
<div class="mt-2 text-sm font-medium text-red-600 md:text-base">

    ⏱ ${table.minutes ?? 0} min

</div>

<div class="mt-3 hidden rounded-lg bg-slate-50 p-3 md:block">

<div class="flex justify-between">

<span> Items</span>

<strong>${table.total_items}</strong>

</div>

<div class="mt-2 flex justify-between">

<span>Total</span>

<strong>${Align.formatCurrency(table.total || 0, 0)}</strong>

</div>

</div>

`

: ""

}
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
        `/admin/order.html?table=${tableId}&area=${areaId}`;

}
loadArea();