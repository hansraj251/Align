if (!API.getToken()) {

    window.location.href =
        "/login.html";

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

    const cachedAreas =
    await CacheService.get(
        "areas"
    );

const cachedTables =
    await CacheService.get(
        "tables"
    );

if (

    cachedAreas.length &&

    cachedTables.length

) {

    renderArea(
        cachedAreas,
        cachedTables
    );

}

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
const areaSync =
    await CacheService.sync(
        "areas",
        areaResponse.areas
    );

const tableSync =
    await CacheService.sync(
        "tables",
        tableResponse.tables
    );

if (
    areaSync.changed ||
    tableSync.changed
) {

    renderArea(
        areaResponse.areas,
        tableResponse.tables
    );

} 

}

function renderArea(
    areas,
    tables
) {

   const area =
       areas.find(
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
        `${tables.filter(
            t => t.area_id == areaId
        ).length} Tables`;

}

    const areaTables =
    tables.filter(
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
        tables
    );

}

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
    table.status === "occupied"
    ? "bg-red-100 text-red-700"
    : table.is_reserved
        ? "bg-amber-100 text-amber-700"
        : "bg-green-100 text-green-700"
}">

${
    table.status === "occupied"
    ? "Occupied"
    : table.is_reserved
        ? "Reserved"
        : "Available"
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
    areaTables
        .filter(
            t =>
                (t.display_row || 1) === row
        )
        .sort((a, b) => {

            const aMatch =
                a.name.match(/\d+$/);

            const bMatch =
                b.name.match(/\d+$/);

            if (aMatch && bMatch) {

                return (
                    Number(aMatch[0]) -
                    Number(bMatch[0])
                );

            }

            return a.name.localeCompare(
                b.name,
                undefined,
                {
                    numeric: true,
                    sensitivity: "base"
                }
            );

        });

        container.innerHTML += `

<div class="mb-8">

<div class="relative">

    <button
        class="row-scroll-left absolute left-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-slate-800 p-2 shadow-md">

        <i class="fas fa-chevron-left"></i>

    </button>

    <div
        class="row-scroll flex gap-4 overflow-x-auto px-10">

${

rowTables.length

? rowTables.map(table => `

<div
onclick="openDashboardOrder(${table.id}, ${table.area_id})"
class="mt-2.5 ml-1 flex min-w-[150px] cursor-pointer flex-col rounded-lg border ${
table.is_reserved
    ? "border-amber-300 bg-amber-50"
    : "border-slate-200 bg-white"
} p-3 shadow-sm transition-all duration-200 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:border-blue-500 hover:bg-blue-50 hover:shadow-2xl active:scale-[0.99] md:min-w-[220px] md:rounded-xl md:p-5">

<div class="flex items-center justify-between">

<h3 class="text-base font-bold md:text-lg">

 ${table.name}

</h3>

<span class="${
    table.status === "occupied"
        ? "text-red-600"
        : table.is_reserved
            ? "text-amber-600"
            : "text-green-600"
}">

${
    table.status === "occupied"
        ? "Occupied"
        : table.is_reserved
            ? "Reserved"
            : "Available"
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
table.is_reserved
? `
<div class="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm">

<div class="font-medium text-amber-700">

Reserved

</div>

<div class="text-slate-700">

${table.reserved_name}

</div>

</div>
`
: ""
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
${
table.status === "available"

? `
<div class="mt-auto pt-3">

${
table.is_reserved

? `
<button
onclick="event.stopPropagation(); clearReservation(${table.id})"
class="mt-auto w-full rounded-lg bg-amber-600 py-2 text-sm text-white">

Clear Reservation

</button>
`

: `
<button
onclick="event.stopPropagation(); reserveTable(${table.id})"
class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50">

Reserve

</button>
`
}

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

    <button
        class="row-scroll-right absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-slate-800 p-2 shadow-md">

        <i class="fas fa-chevron-right"></i>

    </button>

</div>

</div>

`;

    }
    requestAnimationFrame(() => {

    initializeRowScrolls();

});

}
function initializeRowScrolls() {

    document
        .querySelectorAll(".row-scroll")
        .forEach((row) => {

            const wrapper =
                row.parentElement;

            const left =
                wrapper.querySelector(
                    ".row-scroll-left"
                );

            const right =
                wrapper.querySelector(
                    ".row-scroll-right"
                );

            function update() {

                const maxScroll =
                    row.scrollWidth -
                    row.clientWidth;

                if (maxScroll <= 0) {

                    left.classList.add(
                        "hidden"
                    );

                    right.classList.add(
                        "hidden"
                    );

                    return;

                }

                left.classList.toggle(
                    "opacity-40",
                    row.scrollLeft <= 5
                );

                left.classList.toggle(
                    "pointer-events-none",
                    row.scrollLeft <= 5
                );

                right.classList.toggle(
                    "opacity-40",
                    row.scrollLeft >=
                        maxScroll - 5
                );

                right.classList.toggle(
                    "pointer-events-none",
                    row.scrollLeft >=
                        maxScroll - 5
                );

            }

            left.onclick = () => {

                row.scrollBy({
                    left: -row.clientWidth * 0.8,
                    behavior: "smooth"
                });

            };

            right.onclick = () => {

                row.scrollBy({
                    left: row.clientWidth * 0.8,
                    behavior: "smooth"
                });

            };

            row.addEventListener(
                "scroll",
                update
            );

            update();

        });

}
function openDashboardOrder(
    tableId
) {

    window.location.href =
        `/admin/order.html?table=${tableId}&area=${areaId}`;

}

loadArea();
window.refreshReservationView =
    loadArea;
