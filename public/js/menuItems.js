if (!API.getToken()) {
    window.location.href = "/admin/login.html";
}

async function loadCategories() {

    const data = await API.get("/api/menu/categories");

    const category = document.getElementById("category");

    category.innerHTML = `
        <option value="">
            Select Category
        </option>
    `;

    if (!data.success) {
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

loadCategories();

async function loadMenuItems() {

    const data = await API.get("/api/menu/items");

    const list = document.getElementById("itemList");

    list.innerHTML = "";

    if (!data.success) {
        list.innerHTML = "<p>Unable to load menu items.</p>";
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

                </div>

                <div class="text-right">

                    <p class="font-semibold">
                        ₹${item.price}
                    </p>

                    <p class="text-sm">
                        ${item.food_type}
                    </p>

                </div>

            </div>
        `;

    });

}
async function createMenuItem() {

    const data = await API.post(
    "/api/menu/items",
    {
        category_id: document.getElementById("category").value,
        name: document.getElementById("itemName").value,
        price: document.getElementById("price").value,
        food_type: document.getElementById("foodType").value,
        description: document.getElementById("description").value
    }
);

    if (!data.success) {
        Toast.show(data.message, "error");
        return;
    }

    document.getElementById("itemName").value = "";
    document.getElementById("price").value = "";
    document.getElementById("description").value = "";
    document.getElementById("category").value = "";
document.getElementById("foodType").value = "veg";

    loadMenuItems();
    Toast.show("Menu item saved successfully");

}
document
    .getElementById("saveItemBtn")
    .addEventListener("click", createMenuItem);

loadMenuItems();