if (!API.getToken()) {
    window.location.href = "/admin/login.html";
}

async function loadDashboard() {

    const data = await API.get("/api/dashboard");

    if (!data.success) {
        Toast.show(data.message || "Unable to load dashboard", "error");
        return;
    }

    document.getElementById("todaySales").textContent =
        `₹${data.todaySales}`;

    document.getElementById("todayOrders").textContent =
        data.todayOrders;

    document.getElementById("categoryCount").textContent =
        data.categories;

    document.getElementById("menuItemCount").textContent =
        data.menuItems;

}

loadDashboard();