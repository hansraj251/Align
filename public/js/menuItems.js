let editingItemId = null;
let allMenuItems = [];
let currentVariantItemId = null;

let currentVariantItemName = "";
if (!API.getToken()) {

    window.location.href =
        "/admin/login.html";

}

async function loadCategories() {

    const data =
        await API.get("/api/menu/categories");

    const category =
        document.getElementById("category");

    category.innerHTML = `
<option value="">
    Select Category
</option>
`;

    if (!data.success) {

        Toast.show(
            data.message,
            "error"
        );

        return;

    }

    data.categories.forEach(item => {

        category.innerHTML += `
<option value="${item.id}">
    ${item.name}
</option>
`;

    });

}
async function loadMenuItems() {

    const data =
        await API.get("/api/menu/items");

    if (!data.success) {

        document.getElementById("itemList").innerHTML =
            "<p>Unable to load menu items.</p>";

        return;

    }

    allMenuItems = data.items;

    renderMenuItems(allMenuItems);

}

   function renderMenuItems(items) {

    const list =

        document.getElementById("itemList");

    list.innerHTML = "";

    items.forEach(item => {

        list.innerHTML += `

<div class="mb-3 flex items-center justify-between rounded-lg border bg-white p-4">

    <div>

        <h3 class="text-lg font-semibold">

            ${item.name}

        </h3>

        <p class="text-sm text-slate-500">

            ${item.category}

        </p>

        <p class="text-sm text-slate-500">

            ₹${item.price}

            ·

            ${item.food_type}

        </p>

    </div>

    <div class="flex gap-2">

        <button

            class="edit-item rounded bg-amber-500 px-4 py-2 text-white hover:bg-amber-600"

            data-id="${item.id}"

            data-category="${item.category_id}"

            data-name="${encodeURIComponent(item.name)}"

            data-price="${item.price}"

            data-food="${item.food_type}"

            data-description="${encodeURIComponent(item.description || "")}">

            Edit

        </button>

        <button

    class="variants-item rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"

    data-id="${item.id}"

    data-name="${encodeURIComponent(item.name)}">

    Variants

</button>

        <button
    class="toggle-item rounded px-4 py-2 text-white ${
        item.is_available
            ? "bg-green-600 hover:bg-green-700"
            : "bg-slate-600 hover:bg-slate-700"
    }"

    data-id="${item.id}"

    data-available="${item.is_available}">

    ${
        item.is_available
            ? "Available"
            : "Not Available"
    }

</button>

        <button

            class="delete-item rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"

            data-id="${item.id}"

            data-name="${encodeURIComponent(item.name)}">

            Delete

        </button>

    </div>

</div>

`;

    });
    }

async function saveMenuItem() {

    const body = {

        category_id:
            document.getElementById("category").value,
        category_type:

document.getElementById(

"categoryType"

).value,    

        name:
            document.getElementById("itemName").value.trim(),

        price:
            document.getElementById("price").value,

        food_type:
            document.getElementById("foodType").value,

        description:
            document.getElementById("description").value.trim()

    };

    if (!body.category_id) {

        Toast.show(
            "Please select a category",
            "error"
        );

        return;

    }

    if (!body.name) {

        Toast.show(
            "Item name is required",
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
        !!editingItemId;

    if (isEdit) {

        data = await API.put(

            `/api/menu/items/${editingItemId}`,

            body

        );

    } else {

        data = await API.post(

            "/api/menu/items",

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

    await loadMenuItems();

    Toast.show(

        isEdit

            ? "Menu item updated successfully"

            : "Menu item created successfully"

    );

}
function editMenuItem(

    id,

    categoryId,

    name,

    price,

    foodType,

    description

) {

    editingItemId = id;

    document.getElementById("itemId").value =
        id;

    document.getElementById("category").value =
        categoryId;

    document.getElementById("itemName").value =
        name;

    document.getElementById("price").value =
        price;

    document.getElementById("foodType").value =
        foodType;

    document.getElementById("description").value =
        description;

    document.getElementById("saveItemBtn").textContent =
        "Update Item";

    document.getElementById("cancelEditBtn")
        .classList.remove("hidden");

}
function resetForm() {

    editingItemId = null;

    document.getElementById("itemId").value =
        "";

    document.getElementById("category").value =
        "";

    document.getElementById("itemName").value =
        "";

    document.getElementById("price").value =
        "";

    document.getElementById("foodType").value =
        "veg";

    document.getElementById("description").value =
        "";

    document.getElementById("saveItemBtn").textContent =
        "Save Item";

    document.getElementById("cancelEditBtn")
        .classList.add("hidden");

    document.getElementById(
    "categorySearch"
).value = "";    

}
function cancelEdit() {

    resetForm();

}
document.addEventListener("click", async (e) => {

    const editBtn =
        e.target.closest(".edit-item");

    if (editBtn) {

        editMenuItem(

            Number(editBtn.dataset.id),

            Number(editBtn.dataset.category),

            decodeURIComponent(
                editBtn.dataset.name
            ),

            editBtn.dataset.price,

            editBtn.dataset.food,

            decodeURIComponent(
                editBtn.dataset.description
            )

        );

        return;

    }
    const variantBtn =
    e.target.closest(
        ".variants-item"
    );

if (variantBtn) {

    openVariantModal(

        Number(
            variantBtn.dataset.id
        ),

        decodeURIComponent(
            variantBtn.dataset.name
        )

    );

    return;

}

    const deleteBtn =
        e.target.closest(".delete-item");

    if (deleteBtn) {

        deleteMenuItem(

            Number(deleteBtn.dataset.id),

            decodeURIComponent(
                deleteBtn.dataset.name
            )

        );

    }
    const toggleBtn =
    e.target.closest(".toggle-item");

if (toggleBtn) {

    await toggleAvailability(

        Number(toggleBtn.dataset.id),

        Number(toggleBtn.dataset.available)
            ? 0
            : 1

    );

    return;

}

});
async function toggleAvailability(
    id,
    value
) {

    const data =
        await API.patch(

            `/api/menu/items/${id}/availability`,

            {

                is_available:
                    value

            }

        );

    if (!data.success) {

        Toast.show(
            data.message,
            "error"
        );

        return;

    }

    await loadMenuItems();

}
function deleteMenuItem(
    id,
    name
) {

    Modal.confirm(

        "Delete Menu Item",

        `Are you sure you want to delete "${name}"?`,

        async () => {

            const data =
                await API.delete(
                    `/api/menu/items/${id}`
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
                "Menu item deleted successfully"
            );

            await loadMenuItems();

        }

    );

}
async function openVariantModal(
    itemId,
    itemName
) {

    currentVariantItemId =
        itemId;

    currentVariantItemName =
        itemName;

    document.getElementById(
        "variantItemName"
    ).textContent =
        itemName;

    const modal =
    document.getElementById(
        "variantModal"
    );

modal.classList.remove(
    "hidden"
);

modal.classList.add(
    "flex"
);

    await loadVariants();

}
async function loadVariants() {

    const data =
        await API.get(

            `/api/menu/items/${currentVariantItemId}/variants`

        );

    const list =
        document.getElementById(
            "variantList"
        );

    list.innerHTML = "";

    if (!data.success) {

        list.innerHTML =
            "Unable to load variants";

        return;

    }

    data.variants.forEach(renderVariantRow);

}
function renderVariantRow(item = {}) {

    document
        .getElementById(
            "variantList"
        )
        .innerHTML += `

<div

class="variant-row flex items-center gap-3"

data-id="${item.id || ""}">

<input

class="variant-name flex-1 rounded border p-2"

placeholder="Variant"

value="${item.name || ""}">

<input

class="variant-price w-32 rounded border p-2"

type="number"

step="0.01"

placeholder="Price"

value="${item.price || ""}">

<button

class="delete-variant rounded bg-red-600 px-3 py-2 text-white">

🗑

</button>

</div>

`;

}

async function saveVariants() {

    const variants = [];

    document

        .querySelectorAll(
            ".variant-row"
        )

        .forEach(row => {

            const name =
                row.querySelector(
                    ".variant-name"
                ).value.trim();

            const price =
                Number(

                    row.querySelector(
                        ".variant-price"
                    ).value

                );

            if (!name) {

                return;

            }

            variants.push({

                name,

                price

            });

        });

    if (variants.length === 0) {

        Toast.show(
            "Please add at least one variant",
            "error"
        );

        return;

    }

    const data =
        await API.put(

            `/api/menu/items/${currentVariantItemId}/variants`,

            {

                variants

            }

        );

    if (!data.success) {

        Toast.show(
            data.message,
            "error"
        );

        return;

    }

    Toast.show(
        "Variants updated successfully"
    );

    closeVariantModal();

}
function closeVariantModal() {

    const modal =
    document.getElementById(
        "variantModal"
    );

modal.classList.remove(
    "flex"
);

modal.classList.add(
    "hidden"
);

}
document
    .getElementById("menuSearch")
    .addEventListener("input", function () {

        const keyword =
            this.value
                .toLowerCase()
                .trim();

        const filtered =
            allMenuItems.filter(item =>

                item.name
                    .toLowerCase()
                    .includes(keyword)

                ||

                item.category
                    .toLowerCase()
                    .includes(keyword)

                ||

                item.food_type
                    .toLowerCase()
                    .includes(keyword)

            );

        renderMenuItems(filtered);

    });

document
    .getElementById("saveItemBtn")
    .addEventListener(
        "click",
        saveMenuItem
    );

document
    .getElementById("cancelEditBtn")
    .addEventListener(
        "click",
        cancelEdit
    );
document

.getElementById(
    "addVariantBtn"
)

.addEventListener(

    "click",

    () => {

        renderVariantRow();

    }

);
document.addEventListener(

    "click",

    e => {

        const btn =
            e.target.closest(
                ".delete-variant"
            );

        if (!btn) return;

        btn
            .closest(".variant-row")
            .remove();

    }

);
document

.getElementById(
    "saveVariantsBtn"
)

.addEventListener(

    "click",

    saveVariants

);
async function searchCategories(
    keyword
) {

    const box =
        document.getElementById(
            "categoryResults"
        );

    if (!keyword.trim()) {

        box.innerHTML = "";

        box.classList.add(
            "hidden"
        );

        return;

    }

    const data =
        await API.get(

            `/api/category-search?q=${encodeURIComponent(keyword)}`

        );

    box.innerHTML = "";

    if (!data.success) {

        return;

    }

    if (data.categories.length === 0) {

        box.innerHTML = `

<div
class="p-3 text-slate-500">

No category found

</div>

`;

        box.classList.remove(
            "hidden"
        );

        return;

    }

    data.categories.forEach(category => {

        box.innerHTML += `

<div

class="cursor-pointer border-b p-3 hover:bg-slate-100"

onclick="selectCategory(

${category.id},

'${category.name.replace(/'/g, "\\'")}',

${category.is_system}

)">

${category.name}

</div>

`;

    });

    box.classList.remove(
        "hidden"

    );

}

async function searchMenuItems(
    keyword
) {

    const box =
        document.getElementById(
            "itemSuggestions"
        );

    if (!keyword.trim()) {

        box.innerHTML = "";

        box.classList.add(
            "hidden"
        );

        return;

    }

    const data =
        await API.get(

            `/api/system-menu-search?q=${encodeURIComponent(keyword)}`

        );

    box.innerHTML = "";

    if (!data.success) {

        return;

    }

    if (data.items.length === 0) {

        box.innerHTML = `

<div
class="p-3 text-slate-500">

No matching items

</div>

`;

        box.classList.remove(
            "hidden"
        );

        return;

    }

    data.items.forEach(item => {

        box.innerHTML += `

<div

class="item-option cursor-pointer border-b p-3 hover:bg-slate-100"

data-name="${item.name.replace(/"/g,"&quot;")}">

${item.name}

</div>

`;

    });

    box.classList.remove(
        "hidden"
    );

}
document

.getElementById(
    "itemName"
)

.addEventListener(

    "input",

    e=>{

        searchMenuItems(

            e.target.value

        );

    }

);

document.addEventListener(

    "click",

    e=>{

        const option =
            e.target.closest(
                ".item-option"
            );

        if(!option){

            return;

        }

        document
            .getElementById(
                "itemName"
            ).value=

            option.dataset.name;

        document
            .getElementById(
                "itemSuggestions"
            )
            .classList.add(
                "hidden"
            );

    }

);

function selectCategory(

    id,

    name,
    isSystem

) {

    document
        .getElementById(
            "category"
        ).value = id;
    document.getElementById(

        "categoryType"

    ).value=

        isSystem

        ? "system"

        : "custom";    

    document
        .getElementById(
            "categorySearch"
        ).value = name;

    document
        .getElementById(
            "categoryResults"
        )
        .classList.add(
            "hidden"
        );

}

document

.getElementById(
    "categorySearch"
)

.addEventListener(

    "input",

    e => {

        document
            .getElementById(
                "category"
            ).value = "";

        searchCategories(

            e.target.value

        );

    }

);
document.addEventListener(

    "click",

    e => {

        if (

            !e.target.closest(
                ".relative"
            )

        ) {

            document

                .getElementById(
                    "categoryResults"
                )

                .classList.add(
                    "hidden"
                );

        }

    }

);

// loadCategories();

loadMenuItems();