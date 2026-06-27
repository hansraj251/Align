const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "/admin/login.html";
}

async function loadCategories() {

    const response = await fetch("/api/menu/categories", {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    const data = await response.json();

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

    const response = await fetch("/api/menu/categories", {

        method: "POST",

        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },

        body: JSON.stringify({
            name,
            description
        })

    });

    const data = await response.json();

    if (!data.success) {
        alert(data.message);
        return;
    }

    document.getElementById("categoryName").value = "";
    document.getElementById("categoryDescription").value = "";

    loadCategories();

}

document
    .getElementById("saveCategoryBtn")
    .addEventListener("click", createCategory);

loadCategories();

async function deleteCategory(id) {

    if (!confirm("Delete this category?")) {
        return;
    }

    const response = await fetch(
        `/api/menu/categories/${id}`,
        {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    const data = await response.json();

    if (!data.success) {
        alert(data.message);
        return;
    }

    loadCategories();

}