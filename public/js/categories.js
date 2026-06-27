const token = localStorage.getItem("token");
if (!API.getToken()) {
    window.location.href = "/admin/login.html";
}


async function loadCategories() {

    const data = await API.get("/api/menu/categories");

    const list = document.getElementById("categoryList");

    list.innerHTML = "";

    if (!data.success) {
        list.innerHTML = "<p>Unable to load categories.</p>";
        return;
    }

    data.categories.forEach(category => {

        list.innerHTML += `
<div class="mb-3 rounded-lg border bg-white p-4 flex items-center justify-between">

    <div>
        <h3 class="font-semibold text-lg">
            ${category.name}
        </h3>

        <p class="text-sm text-slate-500">
            ${category.description || ""}
        </p>
    </div>

    <button
        onclick="deleteCategory(${category.id})"
        class="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700">

        Delete

    </button>

</div>
`;

    });

}

async function createCategory() {

    const name = document.getElementById("categoryName").value.trim();

    const description =
        document.getElementById("categoryDescription").value.trim();

    if (!name) {
        alert("Category name is required.");
        return;
    }

    const data = await API.post(
    "/api/menu/categories",
    {
        name,
        description
    }
);

    if (!data.success) {
        Toast.show(data.message, "error");
        return;
    }

    document.getElementById("categoryName").value = "";
    document.getElementById("categoryDescription").value = "";

    loadCategories();
    Toast.show("Category created successfully");

}

document
    .getElementById("saveCategoryBtn")
    .addEventListener("click", createCategory);

loadCategories();

async function deleteCategory(id) {

    if (!confirm("Delete this category?")) {
        return;
    }

    const data = await API.delete(
    `/api/menu/categories/${id}`
);

    if (!data.success) {
        Toast.show(data.message, "error");
        return;
    }

    loadCategories();
    Toast.show("Category deleted successfully");

}