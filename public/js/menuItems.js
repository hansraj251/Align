let editingItemId = null;
let allMenuItems = [];
let currentVariantItemId = null;
let currentVariantItemName = "";
let currentPage = 1;
const PAGE_SIZE = 40;
let currentSearch = "";
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

async function loadMenuItems(

    page = 1,

    search = ""

) {

    currentPage = page;

    currentSearch = search;

    const data =
        await API.get(

            `/api/menu/items?page=${page}&limit=${PAGE_SIZE}&search=${encodeURIComponent(search)}`

        );

    if (!data.success) {

        document.getElementById("itemList").innerHTML =
            "<p>Unable to load menu items.</p>";

        return;

    }

    allMenuItems =
        data.items;

    renderMenuItems(
        allMenuItems
    );

    renderPagination(

        data.page,

        data.totalPages

    );

}

function renderMenuItems(items) {

    const list =
        document.getElementById("itemList");

    list.innerHTML = "";

    items.forEach(item => {

        list.innerHTML += `

<div class="rounded-xl border bg-white p-5 shadow-sm transition hover:shadow-md">

    <div class="mb-4 flex items-start justify-between">

        <div>

            <h3 class="text-base font-semibold leading-5">
    ${item.name}
</h3>

            <p class="mt-1 text-xs text-slate-500">

    ${item.category}

</p>

        </div>

        <span class="rounded-full px-3 py-1 text-xs font-semibold ${
            item.food_type === "veg"
                ? "bg-green-100 text-green-700"
                : item.food_type === "non_veg"
                ? "bg-red-100 text-red-700"
                : "bg-yellow-100 text-yellow-700"
        }">

            ${
                item.food_type === "veg"
                    ? "Veg"
                    : item.food_type === "non_veg"
                    ? "Non Veg"
                    : "Egg"
            }

        </span>

    </div>

    <div class="mb-5 flex items-center justify-between">

        <span class="text-slate-500">

            Price

        </span>

       <span class="text-xl font-bold text-blue-600">

    ${

    item.variants.length > 0

        ? `

        <p class="text-sm font-medium text-indigo-600">

            Variants

        </p>

        `

        : `

        <p class="text-xl font-bold text-blue-600">

            ₹${item.price}

        </p>

        `

}

</span>

    </div>

    <div class="grid grid-cols-2 gap-2">

        <button
            class="edit-item rounded-lg bg-amber-500 py-2 text-white transition hover:bg-amber-600"

            data-id="${item.id}"
            data-category="${item.category_id}"
            data-category-name="${encodeURIComponent(item.category)}"
            data-name="${encodeURIComponent(item.name)}"
            data-price="${item.price}"
            data-food="${item.food_type}"
            >

            Edit

        </button>

        <button
            class="variants-item rounded-lg bg-indigo-600 py-2 text-white transition hover:bg-indigo-700"

            data-id="${item.id}"
            data-name="${encodeURIComponent(item.name)}">

            Variants

        </button>

        <label class="flex items-center justify-between rounded-lg border p-2">

    <span class="text-sm font-medium">

        Available

    </span>

    <div class="relative">

        <input
            type="checkbox"
            class="peer sr-only toggle-item"
            data-id="${item.id}"
            ${item.is_available ? "checked" : ""}>

        <div class="h-6 w-11 rounded-full bg-slate-300 transition-colors peer-checked:bg-green-600">

        </div>

        <div
            class="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform duration-200 peer-checked:translate-x-5">

        </div>

    </div>

</label>

        <button
            class="delete-item rounded-lg bg-red-600 py-2 text-white transition hover:bg-red-700"

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

    categoryName,

    name,

    price,

    foodType

) {

    editingItemId = id;

    document.getElementById("itemId").value =
        id;

    document.getElementById("category").value =
        categoryId;
    document.getElementById("categorySearch").value =
    categoryName;    

    document.getElementById("itemName").value =
        name;

    document.getElementById("price").value =
        price;

    document.getElementById("foodType").value =
        foodType;

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
    document.getElementById("categorySearch").value = "";       

    document.getElementById("itemName").value =
        "";

    document.getElementById("price").value =
        "";

    document.getElementById("foodType").value =
        "veg";

    document.getElementById("saveItemBtn").textContent =
        "Save Item";

    document.getElementById("cancelEditBtn")
        .classList.add("hidden");   

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
        editBtn.dataset.categoryName
    ),

    decodeURIComponent(
        editBtn.dataset.name
    ),

    editBtn.dataset.price,

    editBtn.dataset.food

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
    document.addEventListener(
    "change",
    async e => {

        if (
            e.target.classList.contains(
                "toggle-item"
            )
        ) {

            await toggleAvailability(

                Number(e.target.dataset.id),

                e.target.checked ? 1 : 0

            );

        }

    }
);

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
let searchTimer;

document
    .getElementById("menuSearch")
    .addEventListener("input", function () {

        clearTimeout(searchTimer);

        const keyword =
            this.value.trim();

        searchTimer =
            setTimeout(() => {

                loadMenuItems(

                    1,

                    keyword

                );

            }, 300);

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

function renderPagination(

    page,

    totalPages

) {

    // baad me likhenge

}

function renderPagination(

    page,

    totalPages

) {

    const div =
        document.getElementById(
            "pagination"
        );

    div.innerHTML = "";

    if (totalPages <= 1) {

        return;

    }

    div.innerHTML += `

<button

class="rounded border px-4 py-2"

${page === 1 ? "disabled" : ""}

onclick="loadMenuItems(${page - 1}, '${currentSearch}')">

Previous

</button>

`;

    for (

        let i = 1;

        i <= totalPages;

        i++

    ) {

        div.innerHTML += `

<button

class="rounded px-4 py-2 ${
i === page
? "bg-blue-600 text-white"
: "border"
}"

onclick="loadMenuItems(${i}, '${currentSearch}')">

${i}

</button>

`;

    }

    div.innerHTML += `

<button

class="rounded border px-4 py-2"

${page === totalPages ? "disabled" : ""}

onclick="loadMenuItems(${page + 1}, '${currentSearch}')">

Next

</button>

`;

}

// loadCategories();

loadMenuItems();