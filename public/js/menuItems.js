let editingItemId = null;

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

    const list =
        document.getElementById("itemList");

    list.innerHTML = "";

    if (!data.success) {

        list.innerHTML =
            "<p>Unable to load menu items.</p>";

        return;

    }

    data.items.forEach(item => {

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

});
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

loadCategories();

loadMenuItems();