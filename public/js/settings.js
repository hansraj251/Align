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

    const r = data.restaurant;

document.getElementById("restaurantName").value =
    r.name || "";

document.getElementById("ownerName").value =
    r.owner_name || "";

document.getElementById("mobile").value =
    r.mobile || "";

document.getElementById("email").value =
    r.email || "";

document.getElementById("gstNumber").value =
    r.gst_number || "";

document.getElementById("fssaiNumber").value =
    r.fssai_number || "";

document.getElementById("address").value =
    r.address || "";

document.getElementById("city").value =
    r.city || "";

document.getElementById("state").value =
    r.state || "";

document.getElementById("pincode").value =
    r.pincode || "";

}
async function saveRestaurant() {

    const token = localStorage.getItem("token");

    const body = {

        name:
            restaurantName.value,

        owner_name:
            ownerName.value,

        mobile:
            mobile.value,

        email:
            email.value,

        gst_number:
            gstNumber.value,

        fssai_number:
            fssaiNumber.value,

        address:
            address.value,

        city:
            city.value,

        state:
            state.value,

        pincode:
            pincode.value

    };

    const response = await fetch(
        "/api/restaurants/me",
        {
            method: "PUT",

            headers: {

                Authorization: `Bearer ${token}`,

                "Content-Type":
                    "application/json"

            },

            body: JSON.stringify(body)

        }
    );

    const data = await response.json();

    if (!data.success) {

        Toast.show(
            data.message,
            "error"
        );

        return;

    }

    Toast.show(
        "Restaurant profile saved"
    );

}
document
    .getElementById("saveRestaurantBtn")
    .addEventListener(
        "click",
        saveRestaurant
    );
async function loadSettings() {

    const data =
        await API.get("/api/settings");

    if (!data.success) {

        Toast.show(
            data.message,
            "error"
        );

        return;

    }

    const s = data.settings;

    footerMessage.value =
        s.footer_message || "";

    cgst.value =
        s.cgst || 2.5;

    sgst.value =
        s.sgst || 2.5;

}
async function saveSettings() {

    const result =
        await API.put(
            "/api/settings",
            {

                footer_message:
                    footerMessage.value,

                cgst:
                    Number(cgst.value),

                sgst:
                    Number(sgst.value)

            }
        );

    if (!result.success) {

        Toast.show(
            result.message,
            "error"
        );

        return;

    }

    Toast.show(
        "POS Settings Saved"
    );

}    
document
    .getElementById("saveSettingsBtn")
    .addEventListener(
        "click",
        saveSettings
    );
loadRestaurant();

loadSettings();    