if (!API.getToken()) {
    window.location.href = "/admin/login.html";
}

async function loadTables() {

    const data = await API.get("/api/tables");

    const list = document.getElementById("tableList");

    list.innerHTML = "";

    if (!data.success) {

        Toast.show(data.message, "error");
        return;

    }

    data.tables.forEach(table => {

        list.innerHTML += `
<div class="rounded-xl bg-white p-5 shadow">

    <h3 class="text-xl font-bold">
         ${table.name}
    </h3>

    <p class="mt-3 text-slate-500">
        👥 Capacity : ${table.capacity}
    </p>

    <p class="mt-2">

        ${
            table.status === "available"
                ? '<span class="rounded-full bg-green-100 px-3 py-1 text-green-700"> Available</span>'
                : '<span class="rounded-full bg-red-100 px-3 py-1 text-red-700"> Occupied</span>'
        }

    </p>

    <div class="mt-5 flex gap-2">

        <button
            onclick="openOrder(${table.id})"
            class="flex-1 rounded bg-blue-600 px-3 py-2 text-white">

             Open Order

        </button>

        <button
            onclick="deleteTable(${table.id})"
            class="rounded bg-red-600 px-3 py-2 text-white">

            Delete

        </button>

    </div>

</div>
`;

    });

}

async function createTable() {

    const name =
        document.getElementById("tableName").value.trim();

    const capacity =
        document.getElementById("capacity").value;

    if (!name) {

        Toast.show("Table name is required", "error");
        return;

    }

    const data = await API.post(
        "/api/tables",
        {
            name,
            capacity
        }
    );

    if (!data.success) {

        Toast.show(data.message, "error");
        return;

    }

    document.getElementById("tableName").value = "";
    document.getElementById("capacity").value = 4;

    Toast.show("Table created successfully");

    loadTables();

}

document
    .getElementById("saveTableBtn")
    .addEventListener("click", createTable);

loadTables();
async function deleteTable(id) {

    if (!confirm("Delete this table?")) {
        return;
    }

    const data = await API.delete(
        `/api/tables/${id}`
    );

    if (!data.success) {
        Toast.show(data.message, "error");
        return;
    }

    Toast.show("Table deleted");

    loadTables();

}
function openOrder(tableId) {

    window.location.href =
        `/admin/order.html?table=${tableId}`;

}