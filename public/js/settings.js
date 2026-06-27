async function loadRestaurant() {

    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "/admin/login.html";
        return;
    }

    const response = await fetch("/api/restaurants/me", {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    const data = await response.json();

    if (!data.success) {
        alert(data.message);
        return;
    }

    document.getElementById("restaurantName").value =
        data.restaurant.name || "";

}