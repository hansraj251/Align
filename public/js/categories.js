let editingCategoryId = null;
const token = localStorage.getItem("token");
if (!API.getToken()) {
    window.location.href = "/admin/login.html";
}
const isEdit = !!editingCategoryId;

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

    <div class="flex gap-2">

    <button
        class="edit-category rounded bg-amber-500 px-4 py-2 text-white hover:bg-amber-600"
        data-id="${category.id}"
        data-name="${encodeURIComponent(category.name)}"
        data-description="${encodeURIComponent(category.description || "")}">

        Edit

    </button>

    <button
        class="delete-category rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
        data-id="${category.id}"
        data-name="${encodeURIComponent(category.name)}">

        Delete

    </button>

</div>

</div>
`;

    });

}

async function saveCategory() {

    const name = document.getElementById("categoryName").value.trim();

    const description =
        document.getElementById("categoryDescription").value.trim();

    if (!name) {
        alert("Category name is required.");
        return;
    }

    let data;

if (editingCategoryId) {

    data = await API.put(
        `/api/menu/categories/${editingCategoryId}`,
        {
            name,
            description
        }
    );

} else {

    data = await API.post(
        "/api/menu/categories",
        {
            name,
            description
        }
    );

}

    if (!data.success) {
        Toast.show(data.message, "error");
        return;
    }

    document.getElementById("categoryName").value = "";
    document.getElementById("categoryDescription").value = "";

    await loadCategories();
    Toast.show("Category created successfully");
    editingCategoryId = null;

document.getElementById("categoryId").value = "";

document.getElementById("saveCategoryBtn").textContent =
    "Add Category";

document.getElementById("cancelEditBtn")
    .classList.add("hidden");

}

document
    .getElementById("saveCategoryBtn")
    .addEventListener("click", saveCategory);

loadCategories();

document.addEventListener("click", async (e) => {

    const editBtn =
        e.target.closest(".edit-category");

    if (editBtn) {

        editCategory(

            Number(editBtn.dataset.id),

            decodeURIComponent(editBtn.dataset.name),

            decodeURIComponent(editBtn.dataset.description)

        );

        return;

    }

    const deleteBtn =
        e.target.closest(".delete-category");

    if (deleteBtn) {

        deleteCategory(

            Number(deleteBtn.dataset.id),

            decodeURIComponent(deleteBtn.dataset.name)

        );

    }

});

function deleteCategory(id, name) {

    Modal.confirm(

        "Delete Category",

        `Are you sure you want to delete "${name}"?`,

        async () => {

            const data =
                await API.delete(
                    `/api/menu/categories/${id}`
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
                "Category deleted successfully"
            );

            loadCategories();

        }

    );

}
function editCategory(
    id,
    name,
    description
) {

    editingCategoryId = id;

    document.getElementById("categoryId").value =
        id;

    document.getElementById("categoryName").value =
        name;

    document.getElementById("categoryDescription").value =
        description;

    document.getElementById("saveCategoryBtn").textContent =
        "Update Category";

    document.getElementById("cancelEditBtn")
        .classList.remove("hidden");

}
function cancelEdit() {

    editingCategoryId = null;

    document.getElementById("categoryId").value = "";

    document.getElementById("categoryName").value = "";

    document.getElementById("categoryDescription").value = "";

    document.getElementById("saveCategoryBtn").textContent =
        "Add Category";

    document.getElementById("cancelEditBtn")
        .classList.add("hidden");

}
document
    .getElementById("cancelEditBtn")
    .addEventListener(
        "click",
        cancelEdit
    );