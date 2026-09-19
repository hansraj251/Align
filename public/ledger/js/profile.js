(() => {
    "use strict";

    if (
        window.Auth &&
        typeof Auth.requireLogin === "function"
    ) {
        Auth.requireLogin(
            "/ledger/profile.html"
        );
    }

    const token =
        () => localStorage.getItem("token");

    const $ =
        (id) => document.getElementById(id);

    const els = {
        profileForm:
            $("profileForm"),

        profileName:
            $("profileName"),

        profileMobile:
            $("profileMobile"),

        profileEmail:
            $("profileEmail"),

        profileDisplayName:
            $("profileDisplayName"),

        profileDisplayEmail:
            $("profileDisplayEmail"),

        profileInitial:
            $("profileInitial"),

        profileCancelButton:
            $("profileCancelButton"),

        profileFormMessage:
            $("profileFormMessage"),

        profileSaveButton:
            $("profileSaveButton"),

        profileQrImage:
            $("profileQrImage"),

        profileQrRefreshButton:
            $("profileQrRefreshButton"),

        profileQrMessage:
            $("profileQrMessage")
    };

    let originalProfile = null;

    async function api(
        path,
        options = {}
    ) {

        const currentToken =
            token();

        if (!currentToken) {

            Auth.logout(
                "/ledger/login.html"
            );

            throw new Error(
                "Not logged in"
            );

        }

        const response =
            await fetch(
                path,
                {
                    ...options,
                    headers: {
                        ...(options.headers || {}),
                        Authorization:
                            `Bearer ${currentToken}`,
                        "Content-Type":
                            "application/json"
                    }
                }
            );

        if (
            response.status === 401 ||
            response.status === 403
        ) {

            Auth.logout(
                "/ledger/login.html"
            );

            throw new Error(
                "Session expired"
            );

        }

        let data = {};

        try {

            data =
                await response.json();

        }
        catch (_) {

            data = {};

        }

        if (
            !response.ok ||
            data.success === false
        ) {

            throw new Error(
                data.message ||
                `Request failed (${response.status})`
            );

        }

        return data;

    }

    function showMessage(
        message,
        isError = true
    ) {

        els.profileFormMessage.textContent =
            message;

        els.profileFormMessage.hidden =
            false;

        els.profileFormMessage.classList.toggle(
            "success-message",
            !isError
        );

    }

    function clearMessage() {

        els.profileFormMessage.hidden =
            true;

        els.profileFormMessage.textContent =
            "";

        els.profileFormMessage.classList.remove(
            "success-message"
        );

    }

    function renderProfile(
        profile
    ) {

        originalProfile = {
            name: profile.name || "",
            mobile: profile.mobile || ""
        };

        els.profileName.value =
            profile.name || "";

        els.profileMobile.value =
            profile.mobile || "";

        els.profileEmail.value =
            profile.email || "";

        els.profileDisplayName.textContent =
            profile.name || "Profile";

        els.profileDisplayEmail.textContent =
            profile.email || "";

        els.profileInitial.textContent =
            (profile.name || "A")
                .trim()
                .charAt(0)
                .toUpperCase() || "A";

    }

    async function loadProfile() {

        try {

            const data =
                await api(
                    "/api/ledger/profile"
                );

            renderProfile(
                data.profile
            );

        }
        catch (err) {

            showMessage(
                err.message
            );

        }

    }

    async function loadProfileQr() {

        const qrSection =
            $("profileQrSection");

        if (!qrSection) {

            return;

        }

        if (
            !window.AndroidBridge ||
            typeof AndroidBridge.generateQrCode !==
                "function"
        ) {

            qrSection.hidden = true;

            return;

        }

        qrSection.hidden = false;

        els.profileQrMessage.hidden = true;

        els.profileQrMessage.textContent = "";

        els.profileQrImage.hidden = true;

        els.profileQrRefreshButton.disabled = true;

        try {

            const data =
                await api(
                    "/api/ledger/account-qr/"
                );

            const qrImage =
                AndroidBridge.generateQrCode(
                    data.token
                );

            if (!qrImage) {

                throw new Error(
                    "Unable to generate QR code."
                );

            }

            els.profileQrImage.src =
                qrImage;

            els.profileQrImage.hidden =
                false;

        }
        catch (err) {

            console.error(
                "Profile QR load failed:",
                err
            );

            els.profileQrMessage.textContent =
                err.message ||
                "Unable to load QR code.";

            els.profileQrMessage.hidden =
                false;

        }
        finally {

            els.profileQrRefreshButton.disabled =
                false;

        }

    }

    els.profileForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            clearMessage();

            const name =
                els.profileName.value.trim();

            const mobile =
                els.profileMobile.value.trim();

            if (!name) {

                showMessage(
                    "Name is required."
                );

                return;

            }

            if (!mobile) {

                showMessage(
                    "Mobile number is required."
                );

                return;

            }

            els.profileSaveButton.disabled =
                true;

            try {

                const data =
                    await api(
                        "/api/ledger/profile",
                        {
                            method: "PUT",
                            body: JSON.stringify({
                                name,
                                mobile
                            })
                        }
                    );

                renderProfile(
                    data.profile
                );

                showMessage(
                    "Profile updated successfully.",
                    false
                );

            }
            catch (err) {

                showMessage(
                    err.message
                );

            }
            finally {

                els.profileSaveButton.disabled =
                    false;

            }

        }
    );

    els.profileCancelButton.addEventListener(
        "click",
        () => {

            if (!originalProfile) {
                return;
            }

            els.profileName.value =
                originalProfile.name;

            els.profileMobile.value =
                originalProfile.mobile;

            clearMessage();

        }
    );

    els.profileQrRefreshButton.addEventListener(

        "click",

        loadProfileQr

    );

    loadProfile();

    loadProfileQr();

})();
