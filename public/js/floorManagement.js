let floorTables = [];
let floorAreas = [];
async function loadFloorManagement() {

    const areaResponse =
        await API.get("/api/dining-areas");

    const tableResponse =
        await API.get("/api/tables");

    if (
        !areaResponse.success ||
        !tableResponse.success
    ) {

        Toast.show(
            "Unable to load floor management",
            "error"
        );

        return;

    }
floorAreas = areaResponse.areas;

    floorTables = tableResponse.tables;
    renderAreas(

        areaResponse.areas,

        tableResponse.tables

    );

}

function renderAreas(
    areas,
    tables
) {

    const container =
        document.getElementById("areaList");

    container.innerHTML = "";

    areas.forEach(area => {

        const areaTables =
            tables.filter(
                table =>
                    table.area_id === area.id
            );

        const card =
            document.createElement("div");

        card.className =
            "rounded-xl bg-white p-6 shadow";

        card.innerHTML = `
<div class="mb-5 flex items-center justify-between">

    <h2 class="text-xl font-bold">

        ${area.name}

    </h2>

    <div class="flex gap-2">

        <button
            onclick="editArea(${area.id}, '${area.name}')"
            class="rounded bg-amber-500 px-3 py-2 text-white">

            ✏️ Edit

        </button>

        <button
            onclick="deleteArea(${area.id})"
            class="rounded bg-red-600 px-3 py-2 text-white">

            🗑

        </button>

        <button

    onclick="openAddTableModal(${area.id}, '${area.name}')"

    class="rounded bg-blue-600 px-4 py-2 text-white">

    + Add Table

</button>

    </div>

</div>

<div class="grid grid-cols-2 gap-3 xl:grid-cols-4">

</div>
`;

        const list =
    card.querySelector(
        ".grid"
    );

        if (
            areaTables.length === 0
        ) {

            list.innerHTML =
                `
<p class="text-slate-500">

No tables found.

</p>
`;

        } else {

            areaTables.forEach(table => {

                const row =
                    document.createElement(
                        "div"
                    );

                row.className =
                    "flex items-center justify-between rounded-lg border p-4";

                row.innerHTML = `
<div>

    <h3 class="font-semibold">

         ${table.name}

    </h3>

    <p class="mt-1 text-sm text-slate-500">

        👥 ${table.capacity} Seats

    </p>

</div>

<div class="flex items-center gap-3">

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

    <button
        onclick="editTable(${table.id})"
        class="rounded bg-amber-500 px-3 py-2 text-white">

        ✏️ Edit

    </button>

    <button
        onclick="deleteTable(${table.id})"
        class="rounded bg-red-600 px-3 py-2 text-white">

        🗑

    </button>

</div>
`;

                list.appendChild(
                    row
                );

            });

        }

        container.appendChild(
            card
        );

    });

}
document
    .getElementById("addAreaBtn")
    .addEventListener(
        "click",
        addArea
    );

function addArea() {

    Modal.open(

        "Add Dining Area",

        `
<label class="mb-2 block">

Area Name

</label>

<input
    id="areaName"
    class="w-full rounded-lg border p-3">
`,
        async () => {

            const name =
                document
                .getElementById(
                    "areaName"
                )
                .value
                .trim();

            if (!name) {

                Toast.show(
                    "Area name required",
                    "error"
                );

                return;

            }

            const data =
                await API.post(
                    "/api/dining-areas",
                    { name }
                );

            if (!data.success) {

                Toast.show(
                    data.message,
                    "error"
                );

                return;

            }

            Modal.close();

            Toast.show(
                "Dining Area created"
            );

            loadFloorManagement();

        }

    );

}
function editArea(id, currentName) {

    Modal.open(

    "Edit Dining Area",

    `
<label class="mb-2 block font-medium">

    Area Name

</label>

<input
    id="editAreaName"
    value="${currentName}"
    class="w-full rounded-lg border p-3">
`,

    async () => {

        const name =
            document
                .getElementById("editAreaName")
                .value
                .trim();

        if (!name) {

            Toast.show(
                "Area name is required",
                "error"
            );

            return;

        }

        const data =
            await API.put(
                `/api/dining-areas/${id}`,
                { name }
            );

        if (!data.success) {

            Toast.show(
                data.message,
                "error"
            );

            return;

        }

        Modal.close();

        Toast.show(
            "Dining Area updated"
        );

        loadFloorManagement();

    },

    {

        buttonText: "Update",

        buttonClass: "bg-amber-500"

    }

);

}
function deleteArea(id) {

    Modal.confirm(

        "Delete Dining Area",

        "Are you sure you want to delete this dining area?",

        async () => {

            const data =
                await API.delete(
                    `/api/dining-areas/${id}`
                );

            if (!data.success) {

                Toast.show(
                    data.message,
                    "error"
                );

                return;

            }

            Modal.close();

            Toast.show(
                "Dining Area deleted"
            );

            loadFloorManagement();

        }

    );

}
async function openAddTableModal(
    areaId,
    areaName
) {

    Modal.open(

        `Add Table - ${areaName}`,

        `
<label class="mb-2 block">

Table Name

</label>

<input
    id="tableName"
    class="mb-4 w-full rounded-lg border p-3">

<label class="mb-2 block">

Capacity

</label>

<input
    id="tableCapacity"
    type="number"
    min="1"
    max="100"
    value="4"
    class="w-full rounded-lg border p-3">
`,
        async () => {

            const name =
                document
                    .getElementById("tableName")
                    .value
                    .trim();

            const capacity =
    Number(
        document
            .getElementById("tableCapacity")
            .value
    );


            if (!name) {

                Toast.show(
                    "Table name is required",
                    "error"
                );

                return;

            }

            const data =
                await API.post(
                    "/api/tables",
                    {

                        name,

                        capacity,

                        area_id: areaId,
                

                    }
                );

            if (!data.success) {

                Toast.show(
                    data.message,
                    "error"
                );

                return;

            }

            Modal.close();

            Toast.show(
                "Table created successfully"
            );

            loadFloorManagement();

        }

    );

}
function editTable(tableId) {

    const table =
        floorTables.find(
            t => t.id == tableId
        );

    if (!table) {

        Toast.show(
            "Table not found",
            "error"
        );

        return;

    }

    const areaOptions =
        floorAreas.map(area => `
<option
    value="${area.id}"
    ${
        area.id == table.area_id
            ? "selected"
            : ""
    }>

    ${area.name}

</option>
`).join("");

    Modal.open(

        "Edit Table",

        `
<label class="mb-2 block font-medium">

Table Name

</label>

<input
    id="editTableName"
    value="${table.name}"
    class="mb-4 w-full rounded-lg border p-3">

<label class="mb-2 block font-medium">

Capacity

</label>

<input
    id="editTableCapacity"
    type="number"
    min="1"
    max="100"
    value="${table.capacity}"
    class="mb-4 w-full rounded-lg border p-3">
<label class="mt-4 mb-2 block">

Display Row

</label>

<input
    id="tableRow"
    type="number"
    min="1"
    value="${table.display_row || 1}"
    class="w-full rounded-lg border p-3">

<label class="mb-2 block font-medium">

Dining Area

</label>

<select
    id="editTableArea"
    class="w-full rounded-lg border p-3">

    ${areaOptions}

</select>
`,

        async () => {

            const data =
                await API.put(

                    `/api/tables/${tableId}`,

                    {

                        name:
                            document
                                .getElementById("editTableName")
                                .value
                                .trim(),

                        capacity:
                            Number(
                                document
                                    .getElementById("editTableCapacity")
                                    .value
                            ),

                        area_id:
                            Number(
                                document
                                    .getElementById("editTableArea")
                                    .value
                            ),
                         display_row:
                              Number(
                                document
                                    .getElementById("tableRow")
                                    .value

        )    

                    }

                );

            if (!data.success) {

                Toast.show(
                    data.message,
                    "error"
                );

                return;

            }

            Modal.close();

            Toast.show(
                "Table updated successfully"
            );

            loadFloorManagement();

        },

        {

            buttonText: "Update",

            buttonClass: "bg-amber-500"

        }

    );

}
async function deleteTable(tableId) {

    const table =
        floorTables.find(
            t => t.id == tableId
        );

    if (!table) {

        Toast.show(
            "Table not found",
            "error"
        );

        return;

    }

    Modal.confirm(

        "Delete Table",

        `Are you sure you want to delete "${table.name}"?`,

        async () => {

            const data =
                await API.delete(
                    `/api/tables/${tableId}`
                );

            if (!data.success) {

                Toast.show(
                    data.message,
                    "error"
                );

                return;

            }

            Modal.close();

            Toast.show(
                "Table deleted successfully"
            );

            loadFloorManagement();

        }

    );

}
loadFloorManagement();