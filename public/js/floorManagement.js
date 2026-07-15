let floorTables = [];
let floorAreas = [];
let selectedAreaId = null;
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
floorAreas =
    areaResponse.areas.filter(
        area =>
            area.system_key !==
            "takeaway"
    );

floorTables =
    tableResponse.tables.filter(
        table =>
            table.system_key !==
            "takeaway"
    );

if (
    !floorAreas.some(
        area =>
            area.id === selectedAreaId
    )
) {

    selectedAreaId =
        floorAreas.length
            ? floorAreas[0].id
            : null;

}

renderAreas();

}

function renderAreas() {

    const tabContainer =
        document.getElementById("areaTabs");

    const tableContainer =
        document.getElementById("tableList");

    tabContainer.innerHTML = "";
    tableContainer.innerHTML = "";

    // Area Tabs
    floorAreas.forEach(area => {

        tabContainer.innerHTML += `

<button
    onclick="selectArea(${area.id})"
    class="rounded-lg px-4 py-2 font-medium ${
        selectedAreaId === area.id
            ? "bg-blue-600 text-white"
            : "border bg-white"
    }">

    ${area.name}

</button>

`;

    });

    // Selected Area Tables
    const areaTables =
        floorTables.filter(
            table =>
                table.area_id === selectedAreaId
        );
    const actionContainer =
    document.getElementById(
        "areaActions"
    );

const currentArea =
    floorAreas.find(
        area =>
            area.id === selectedAreaId
    );
if (!currentArea) {

    actionContainer.innerHTML = "";

    return;

}    

actionContainer.innerHTML = `

<button
    onclick="editArea(${currentArea.id})"
    class="rounded bg-amber-500 px-4 py-2 text-white">

    ✏️ Edit Area

</button>

<button
    onclick="deleteArea(${currentArea.id})"
    class="rounded bg-red-600 px-4 py-2 text-white">

    🗑 Delete Area

</button>

<button
    onclick="openAddTableModal(${currentArea.id}, '${currentArea.name}')"
    class="rounded bg-blue-600 px-4 py-2 text-white">

    + Add Table

</button>

`;    

    if (areaTables.length === 0) {

        tableContainer.innerHTML = `

<div class="col-span-full rounded-xl bg-white p-8 text-center shadow">

    No tables found.

</div>

`;

        return;

    }

    areaTables.forEach(table => {

        const row =
            document.createElement("div");

        row.className =
            "rounded-lg border bg-white p-4 shadow";

        row.innerHTML = `

<div class="space-y-3">

    <div class="flex items-center justify-between">

        <div>

            <h3 class="text-lg font-semibold">

                ${table.name}

            </h3>

            <p class="mt-1 text-sm text-slate-500">

                👥 ${table.capacity} Seats

            </p>

        </div>

        <span class="${
            table.status === "available"
                ? "text-green-600"
                : "text-red-600"
        } font-medium">

            ${
                table.status === "available"
                    ? "🟢 Available"
                    : "🔴 Occupied"
            }

        </span>

    </div>

    <div class="flex flex-wrap gap-2">

        <button
            onclick="editTable(${table.id})"
            class="flex-1 rounded bg-amber-500 px-3 py-2 text-white">

            ✏️ Edit

        </button>

        <button
            onclick="deleteTable(${table.id})"
            class="flex-1 rounded bg-red-600 px-3 py-2 text-white">

            🗑 Delete

        </button>

    </div>

</div>

`;

        tableContainer.appendChild(row);

    });

    
    

}
function selectArea(id) {

    selectedAreaId = id;

    renderAreas();

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
function editArea(id) {

    const currentArea =
        floorAreas.find(
            area => area.id == id
        );

    if (!currentArea) {

        Toast.show(
            "Area not found",
            "error"
        );

        return;

    }

    Modal.open(

    "Edit Dining Area",

    `
<label class="mt-4 mb-2 block font-medium">
Card Color
</label>

<select
    id="editAreaColor"
    class="w-full rounded-lg border p-3">

    <option value="blue">🔵 Blue</option>
    <option value="emerald">🟢 Green</option>
    <option value="orange">🟠 Orange</option>
    <option value="violet">🟣 Purple</option>
    <option value="rose">🔴 Rose</option>
    <option value="slate">⚫ Slate</option>

</select>

    <label class="mt-2 mb-2 block font-medium">

    Area Name

</label>



<input
    id="editAreaName"
    value="${currentArea.name}"
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
        {
            name,
            card_color:
                document.getElementById(
                    "editAreaColor"
                ).value
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
            "Dining Area updated"
        );

        loadFloorManagement();

    },

    {

        buttonText: "Update",

        buttonClass: "bg-amber-500"

    }

);
setTimeout(() => {

    document.getElementById(
        "editAreaColor"
    ).value =
        currentArea.card_color || "blue";

}, 0);


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