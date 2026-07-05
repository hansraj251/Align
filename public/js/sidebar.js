async function loadSidebarRestaurant() {

    const token = localStorage.getItem("token");

    if (!token) return;

    try {

        const response = await fetch(
            "/api/restaurants/me",
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!data.success) return;

        const restaurant = data.restaurant;

        const mobileName =
    document.getElementById(
        "mobileRestaurantName"
    );

if (mobileName) {

    mobileName.textContent =
        restaurant.name || "ALIGN";

}

        const nameElement =
            document.getElementById(
                "sidebarRestaurantName"
            );

        if (nameElement) {

            nameElement.textContent =
                restaurant.name || "ALIGN";

        }

        const img =
            document.getElementById(
                "sidebarLogo"
            );

        if (img && restaurant.logo) {

            img.src = restaurant.logo;

            img.classList.remove("hidden");

        }

    } catch (err) {

        console.error(err);

    }
    

}

function initializeSidebar() {

    const logoutBtn =
        document.getElementById("logoutBtn");

    if (logoutBtn) {

        logoutBtn.addEventListener(
            "click",
            Auth.logout
        );

    }

}
