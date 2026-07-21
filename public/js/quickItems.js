let editingQuickItemId = null;

let allQuickItems = [];

if (!API.getToken()) {

    window.location.href =
        "/login.html";

}

async function loadQuickItems() {

    const data =
        await API.get(
            "/api/quick-items"
        );

    const list =
        document.getElementById(
            "quickItemList"
        );

    if (!data.success) {

        list.innerHTML = `

<p>

Unable to load quick items.

</p>

`;

        Toast.show(
            data.message,
            "error"
        );

        return;

    }

    allQuickItems =
        data.data;

    renderQuickItems(
        allQuickItems
    );

}
function renderQuickItems(
    items
) {

    const list =
        document.getElementById(
            "quickItemList"
        );

    list.innerHTML = "";

    items.forEach(item => {

        list.innerHTML += `

<div

class="rounded-xl border bg-white p-5 shadow-sm transition hover:shadow-md">

    <div class="mb-3">

        <h3
            class="text-lg font-semibold">

            ${item.name}

        </h3>

    </div>

    <div
        class="mb-2 flex justify-between">

        <span>

            Price

        </span>

        <span
            class="font-bold text-blue-600">

            ${Align.formatCurrency(item.price)}

        </span>

    </div>

    <div
        class="mb-4 flex justify-between">

        <span>

            Sort Order

        </span>

        <span>

            ${item.sort_order}

        </span>

    </div>

    <label
        class="mb-4 flex items-center justify-between rounded-lg border p-2">

        <span>

            Active

        </span>

        <div class="relative">

            <input

                type="checkbox"

                class="peer sr-only toggle-item"

                data-id="${item.id}"

                ${item.active ? "checked" : ""}>

            <div
                class="h-6 w-11 rounded-full bg-slate-300 peer-checked:bg-green-600">

            </div>

            <div
                class="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform peer-checked:translate-x-5">

            </div>

        </div>

    </label>

    <div
        class="grid grid-cols-2 gap-2">

        <button

            class="edit-item rounded-lg bg-amber-500 py-2 text-white"

            data-id="${item.id}">

            Edit

        </button>

        <button

            class="delete-item rounded-lg bg-red-600 py-2 text-white"

            data-id="${item.id}"

            data-name="${encodeURIComponent(item.name)}">

            Delete

        </button>

    </div>

</div>

`;

    });

}
async function saveQuickItem() {

    const body = {

        name:
            document
                .getElementById(
                    "quickItemName"
                )
                .value
                .trim(),

        price:
            document
                .getElementById(
                    "quickItemPrice"
                )
                .value,

        sort_order:
            document
                .getElementById(
                    "quickItemSortOrder"
                )
                .value,

        active:
            document
                .getElementById(
                    "quickItemActive"
                )
                .checked
                ? 1
                : 0

    };

    if (!body.name) {

        Toast.show(
            "Quick item name is required",
            "error"
        );

        return;

    }

    if (!body.price) {

        Toast.show(
            "Price is required",
            "error"
        );

        return;

    }

    let data;

    const isEdit =
        !!editingQuickItemId;

    if (isEdit) {

        data =
            await API.put(

                `/api/quick-items/${editingQuickItemId}`,

                body

            );

    } else {

        data =
            await API.post(

                "/api/quick-items",

                body

            );

    }

    if (!data.success) {

        Toast.show(
            data.message,
            "error"
        );

        return;

    }

    resetForm();

    await loadQuickItems();

    Toast.show(

        isEdit

            ? "Quick item updated successfully"

            : "Quick item created successfully"

    );

}
function editQuickItem(
    item
) {

    editingQuickItemId =
        item.id;

    document
        .getElementById(
            "quickItemId"
        ).value =
        item.id;

    document
        .getElementById(
            "quickItemName"
        ).value =
        item.name;

    document
        .getElementById(
            "quickItemPrice"
        ).value =
        item.price;

    document
        .getElementById(
            "quickItemSortOrder"
        ).value =
        item.sort_order;

    document
        .getElementById(
            "quickItemActive"
        ).checked =
        !!item.active;

    document
        .getElementById(
            "saveQuickItemBtn"
        ).textContent =
        "Update Quick Item";

    document
        .getElementById(
            "cancelEditBtn"
        )
        .classList
        .remove(
            "hidden"
        );

}
function resetForm() {

    editingQuickItemId =
        null;

    document
        .getElementById(
            "quickItemId"
        ).value =
        "";

    document
        .getElementById(
            "quickItemName"
        ).value =
        "";

    document
        .getElementById(
            "quickItemPrice"
        ).value =
        "";

    document
        .getElementById(
            "quickItemSortOrder"
        ).value =
        0;

    document
        .getElementById(
            "quickItemActive"
        ).checked =
        true;

    document
        .getElementById(
            "saveQuickItemBtn"
        ).textContent =
        "Save Quick Item";

    document
        .getElementById(
            "cancelEditBtn"
        )
        .classList
        .add(
            "hidden"
        );

}
function cancelEdit() {

    resetForm();

}
function deleteQuickItem(
    id,
    name
) {

    Modal.confirm(

        "Delete Quick Item",

        `Are you sure you want to delete "${name}"?`,

        async () => {

            const data =
                await API.delete(
                    `/api/quick-items/${id}`
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
                "Quick item deleted successfully"
            );

            await loadQuickItems();

        }

    );

}
async function toggleActive(
    id,
    active
) {

    const data =
        await API.patch(

            `/api/quick-items/${id}/active`,

            {
                active
            }

        );

    if (!data.success) {

        Toast.show(
            data.message,
            "error"
        );

        return;

    }

    const item =
        allQuickItems.find(
            i => i.id === id
        );

    if (item) {

        item.active = active;

    }

    Toast.show(
        active
            ? "Quick item activated"
            : "Quick item deactivated"
    );

}
document.addEventListener(
    "click",
    e => {

        const editBtn =
            e.target.closest(
                ".edit-item"
            );

        if (editBtn) {

            const item =
                allQuickItems.find(
                    i =>
                        i.id === Number(
                            editBtn.dataset.id
                        )
                );

            if (item) {

                editQuickItem(
                    item
                );

            }

            return;

        }

        const deleteBtn =
            e.target.closest(
                ".delete-item"
            );

        if (deleteBtn) {

            deleteQuickItem(

                Number(
                    deleteBtn.dataset.id
                ),

                decodeURIComponent(
                    deleteBtn.dataset.name
                )

            );

        }

    }
);

document.addEventListener(
    "change",
    async e => {

        if (

            e.target.classList.contains(
                "toggle-item"
            )

        ) {

            await toggleActive(

                Number(
                    e.target.dataset.id
                ),

                e.target.checked
                    ? 1
                    : 0

            );

        }

    }
);
document
    .getElementById(
        "saveQuickItemBtn"
    )
    .addEventListener(
        "click",
        saveQuickItem
    );

document
    .getElementById(
        "cancelEditBtn"
    )
    .addEventListener(
        "click",
        cancelEdit
    );
loadQuickItems();    