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
        profilePhoto:
            $("profilePhoto"),
        profilePhotoButton:
            $("profilePhotoButton"),
        profilePhotoInput:
            $("profilePhotoInput"),
        profilePhotoMessage:
            $("profilePhotoMessage"),
        profileCropModal:
            $("profileCropModal"),
        profileCropClose:
            $("profileCropClose"),
        profileCropArea:
            $("profileCropArea"),
        profileCropImage:
            $("profileCropImage"),
        profileCropZoomOut:
            $("profileCropZoomOut"),
        profileCropZoom:
            $("profileCropZoom"),
        profileCropZoomIn:
            $("profileCropZoomIn"),
        profileCropCancel:
            $("profileCropCancel"),
        profileCropApply:
            $("profileCropApply"),
        profileCropMessage:
            $("profileCropMessage"),

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

    let cropState = {
        file: null,
        imageUrl: "",
        imageWidth: 0,
        imageHeight: 0,
        scale: 1,
        minScale: 1,
        x: 0,
        y: 0,
        dragging: false,
        pointerX: 0,
        pointerY: 0
    };

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

        if (profile.profilePhoto) {

            els.profilePhoto.src =
                `${profile.profilePhoto}?t=${Date.now()}`;

            els.profilePhoto.hidden =
                false;

            els.profileInitial.hidden =
                true;

        }
        else {

            els.profilePhoto.hidden =
                true;

            els.profilePhoto.removeAttribute("src");

            els.profileInitial.hidden =
                false;

        }

    }

    function showProfilePhotoMessage(
        message,
        isError = true
    ) {
        els.profilePhotoMessage.textContent =
            message;

        els.profilePhotoMessage.hidden =
            false;

        els.profilePhotoMessage.classList.toggle(
            "success-message",
            !isError
        );
    }

    function clearProfilePhotoMessage() {
        els.profilePhotoMessage.textContent =
            "";

        els.profilePhotoMessage.hidden =
            true;

        els.profilePhotoMessage.classList.remove(
            "success-message"
        );
    }

    function setCropImageTransform() {

        els.profileCropImage.style.transform =
            `translate(-50%, -50%) ` +
            `translate(${cropState.x}px, ${cropState.y}px) ` +
            `scale(${cropState.scale})`;
    }

    function getCropAreaSize() {

        return els.profileCropArea
            .getBoundingClientRect()
            .width;
    }

    function updateCropBounds() {

        const areaSize =
            getCropAreaSize();

        const baseScale =
            Math.max(
                areaSize /
                    cropState.imageWidth,
                areaSize /
                    cropState.imageHeight
            );

        cropState.minScale =
            baseScale;

        if (
            cropState.scale <
            cropState.minScale
        ) {
            cropState.scale =
                cropState.minScale;
        }

        const displayedWidth =
            cropState.imageWidth *
            cropState.scale;

        const displayedHeight =
            cropState.imageHeight *
            cropState.scale;

        const maxX =
            Math.max(
                0,
                (displayedWidth - areaSize) / 2
            );

        const maxY =
            Math.max(
                0,
                (displayedHeight - areaSize) / 2
            );

        cropState.x =
            Math.max(
                -maxX,
                Math.min(
                    maxX,
                    cropState.x
                )
            );

        cropState.y =
            Math.max(
                -maxY,
                Math.min(
                    maxY,
                    cropState.y
                )
            );

        els.profileCropZoom.min =
            cropState.minScale;

        els.profileCropZoom.max =
            cropState.minScale * 3;

        els.profileCropZoom.value =
            cropState.scale;

        setCropImageTransform();
    }

    function closeProfileCrop() {

        if (cropState.imageUrl) {
            URL.revokeObjectURL(
                cropState.imageUrl
            );
        }

        cropState.file = null;
        cropState.imageUrl = "";
        cropState.imageWidth = 0;
        cropState.imageHeight = 0;
        cropState.scale = 1;
        cropState.minScale = 1;
        cropState.x = 0;
        cropState.y = 0;
        cropState.dragging = false;

        els.profileCropImage.removeAttribute(
            "src"
        );

        els.profileCropModal.hidden =
            true;

        els.profileCropMessage.hidden =
            true;

        els.profileCropMessage.textContent =
            "";
    }

    function openProfileCrop(file) {

        clearProfilePhotoMessage();

        cropState.file = file;
        cropState.imageUrl =
            URL.createObjectURL(file);
        cropState.x = 0;
        cropState.y = 0;
        cropState.scale = 1;

        els.profileCropImage.onload =
            () => {

                cropState.imageWidth =
                    els.profileCropImage
                        .naturalWidth;

                cropState.imageHeight =
                    els.profileCropImage
                        .naturalHeight;

                updateCropBounds();
            };

        els.profileCropImage.src =
            cropState.imageUrl;

        els.profileCropModal.hidden =
            false;
    }

    function setCropZoom(
        value
    ) {

        const zoom =
            Number(value);

        if (
            !Number.isFinite(zoom) ||
            zoom < cropState.minScale
        ) {
            return;
        }

        cropState.scale =
            zoom;

        updateCropBounds();
    }

    function startCropDrag(
        event
    ) {

        event.preventDefault();

        cropState.dragging =
            true;

        cropState.pointerX =
            event.clientX;

        cropState.pointerY =
            event.clientY;

        els.profileCropArea
            .setPointerCapture(
                event.pointerId
            );
    }

    function moveCropDrag(
        event
    ) {

        if (
            !cropState.dragging
        ) {
            return;
        }

        const deltaX =
            event.clientX -
            cropState.pointerX;

        const deltaY =
            event.clientY -
            cropState.pointerY;

        cropState.pointerX =
            event.clientX;

        cropState.pointerY =
            event.clientY;

        cropState.x +=
            deltaX;

        cropState.y +=
            deltaY;

        updateCropBounds();
    }

    function endCropDrag(
        event
    ) {

        if (
            !cropState.dragging
        ) {
            return;
        }

        cropState.dragging =
            false;

        if (
            event.pointerId !== undefined &&
            els.profileCropArea
                .hasPointerCapture(
                    event.pointerId
                )
        ) {
            els.profileCropArea
                .releasePointerCapture(
                    event.pointerId
                );
        }
    }

    async function uploadProfilePhoto(
        file
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

        const formData =
            new FormData();

        formData.append(
            "photo",
            file
        );

        const response =
            await fetch(
                "/api/ledger/profile/photo",
                {
                    method: "POST",
                    headers: {
                        Authorization:
                            `Bearer ${currentToken}`
                    },
                    body: formData
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

    async function createCroppedProfilePhoto() {

        const areaSize =
            getCropAreaSize();

        const canvas =
            document.createElement(
                "canvas"
            );

        canvas.width =
            512;

        canvas.height =
            512;

        const context =
            canvas.getContext(
                "2d"
            );

        const image =
            els.profileCropImage;

        const sourceScale =
            cropState.scale;

        const displayedWidth =
            cropState.imageWidth *
            sourceScale;

        const displayedHeight =
            cropState.imageHeight *
            sourceScale;

        const imageLeft =
            (
                areaSize -
                displayedWidth
            ) / 2 +
            cropState.x;

        const imageTop =
            (
                areaSize -
                displayedHeight
            ) / 2 +
            cropState.y;

        const sourceX =
            -imageLeft /
            sourceScale;

        const sourceY =
            -imageTop /
            sourceScale;

        const sourceSize =
            areaSize /
            sourceScale;

        context.drawImage(
            image,
            sourceX,
            sourceY,
            sourceSize,
            sourceSize,
            0,
            0,
            canvas.width,
            canvas.height
        );

        return await new Promise(
            (resolve, reject) => {

                canvas.toBlob(
                    blob => {

                        if (!blob) {
                            reject(
                                new Error(
                                    "Unable to crop photo."
                                )
                            );

                            return;
                        }

                        resolve(
                            new File(
                                [
                                    blob
                                ],
                                "profile-photo.jpg",
                                {
                                    type:
                                        "image/jpeg",
                                    lastModified:
                                        Date.now()
                                }
                            )
                        );
                    },
                    "image/jpeg",
                    0.92
                );
            }
        );
    }

    async function applyProfileCrop() {

        if (
            !cropState.file ||
            !cropState.imageWidth ||
            !cropState.imageHeight
        ) {
            return;
        }

        els.profileCropApply.disabled =
            true;

        els.profileCropCancel.disabled =
            true;

        els.profileCropMessage.hidden =
            true;

        try {

            const croppedFile =
                await createCroppedProfilePhoto();

            const data =
                await uploadProfilePhoto(
                    croppedFile
                );

            if (
                data.profile &&
                data.profile.profilePhoto
            ) {

                els.profilePhoto.src =
                    `${data.profile.profilePhoto}?t=${Date.now()}`;

                els.profilePhoto.hidden =
                    false;

                els.profileInitial.hidden =
                    true;
            }

            closeProfileCrop();

            showProfilePhotoMessage(
                "Profile photo updated successfully.",
                false
            );
        }
        catch (err) {

            els.profileCropMessage.textContent =
                err.message;

            els.profileCropMessage.hidden =
                false;
        }
        finally {

            els.profileCropApply.disabled =
                false;

            els.profileCropCancel.disabled =
                false;
        }
    }

    async function handleProfilePhotoChange(
        event
    ) {

        clearProfilePhotoMessage();

        const file =
            event.target.files &&
            event.target.files[0];

        if (!file) {
            return;
        }

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];

        if (
            !allowedTypes.includes(
                file.type
            )
        ) {
            showProfilePhotoMessage(
                "Only JPG, PNG and WebP images are allowed."
            );

            els.profilePhotoInput.value =
                "";

            return;
        }

        if (
            file.size >
            5 * 1024 * 1024
        ) {
            showProfilePhotoMessage(
                "Profile photo must be 5 MB or smaller."
            );

            els.profilePhotoInput.value =
                "";

            return;
        }

        openProfileCrop(file);
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

    els.profilePhotoButton.addEventListener(
        "click",
        () => {
            clearProfilePhotoMessage();
            els.profilePhotoInput.click();
        }
    );

    els.profileCropZoom.addEventListener(
        "input",
        () => {
            setCropZoom(
                els.profileCropZoom.value
            );
        }
    );

    els.profileCropZoomOut.addEventListener(
        "click",
        () => {
            setCropZoom(
                Number(
                    els.profileCropZoom.value
                ) - (
                    cropState.minScale *
                    0.1
                )
            );
        }
    );

    els.profileCropZoomIn.addEventListener(
        "click",
        () => {
            setCropZoom(
                Number(
                    els.profileCropZoom.value
                ) + (
                    cropState.minScale *
                    0.1
                )
            );
        }
    );

    els.profileCropArea.addEventListener(
        "pointerdown",
        startCropDrag
    );

    els.profileCropApply.addEventListener(
        "click",
        applyProfileCrop
    );

    els.profileCropClose.addEventListener(
        "click",
        closeProfileCrop
    );

    els.profileCropCancel.addEventListener(
        "click",
        closeProfileCrop
    );

    els.profileCropArea.addEventListener(
        "pointermove",
        moveCropDrag
    );

    els.profileCropArea.addEventListener(
        "pointerup",
        endCropDrag
    );

    els.profileCropArea.addEventListener(
        "pointercancel",
        endCropDrag
    );

    els.profilePhotoInput.addEventListener(
        "change",
        handleProfilePhotoChange
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
