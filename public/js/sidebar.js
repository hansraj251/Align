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

        document.getElementById(
            "sidebarRestaurantName"
        ).textContent =
            restaurant.name || "ALIGN";

        if (restaurant.logo) {

            const img =
                document.getElementById(
                    "sidebarLogo"
                );

            img.src = restaurant.logo;

            img.classList.remove("hidden");

        }

    } catch (err) {

        console.error(err);

    }

}
