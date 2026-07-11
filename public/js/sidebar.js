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

if (img) {

    if (restaurant.logo) {

        img.onload = () => {

            img.classList.remove("hidden");

        };

        img.onerror = () => {

            img.classList.add("hidden");

            img.removeAttribute("src");

        };

        img.src = restaurant.logo;

    } else {

        img.classList.add("hidden");

        img.removeAttribute("src");

    }

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
