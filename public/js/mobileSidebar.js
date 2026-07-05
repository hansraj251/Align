const MobileSidebar = {

    init() {

        const header =
            document.getElementById("mobileHeader");

        const main =
            document.getElementById("mainContent");

        const overlay =
            document.getElementById("sidebarOverlay");

        if (
            !header ||
            !main ||
            !overlay
        ) return;

        // Mobile Menu Button
        header.innerHTML = `

<div
    class="fixed top-0 left-0 right-0 z-[60] flex h-14 items-center border-b bg-white shadow">

    <button
        id="mobileMenuBtn"
        class="ml-3 rounded-lg p-2">

        ☰

    </button>

    <h1
        id="mobileRestaurantName"
        class="absolute left-1/2 -translate-x-1/2 text-lg font-semibold truncate max-w-[60%]">

        ALIGN

    </h1>

</div>

`;


        const menu =
            document.getElementById(
                "mobileMenuBtn"
            );

        const drawer =
            document.getElementById(
                "sidebarDrawer"
            );

        const closeBtn =
            document.getElementById(
                "closeSidebarBtn"
            );

        if (
            !menu ||
            !drawer ||
            !closeBtn
        ) return;

        function isPortrait() {

            return window.matchMedia(
                "(orientation: portrait)"
            ).matches;

        }

        function openSidebar() {

            if (!isPortrait()) return;

            drawer.classList.remove(
                "-translate-x-full"
            );

            overlay.classList.remove(
                "hidden"
            );

            main.classList.add(
                "hidden"
            );

            menu.classList.add(
                "hidden"
            );

        }

        function closeSidebar() {

            drawer.classList.add(
                "-translate-x-full"
            );

            overlay.classList.add(
                "hidden"
            );

            main.classList.remove(
                "hidden"
            );

            menu.classList.remove(
                "hidden"
            );

        }

        menu.onclick =
            openSidebar;

        closeBtn.onclick =
            closeSidebar;

        overlay.onclick =
            closeSidebar;

       function updateLayout() {

    const portrait =
        window.matchMedia("(orientation: portrait)").matches;

    if (portrait) {

        // Drawer Mode
        drawer.classList.remove(
            "relative"
        );
        header.classList.remove("hidden");

        drawer.classList.add(
            "fixed",
            "-translate-x-full"
        );

        overlay.classList.add(
            "hidden"
        );

        main.classList.remove(
            "hidden"
        );

        menu.classList.remove(
            "hidden"
        );

        closeBtn.classList.remove(
            "hidden"
        );

    } else {

        // Desktop / Landscape Mode

        drawer.classList.remove(
            "fixed",
            "-translate-x-full"
        );
        header.classList.add("hidden");

        drawer.classList.add(
            "relative"
        );

        overlay.classList.add(
            "hidden"
        );

        main.classList.remove(
            "hidden"
        );

        menu.classList.add(
            "hidden"
        );

        closeBtn.classList.add(
            "hidden"
        );

    }

}

        updateLayout();

        window.addEventListener(
            "resize",
            updateLayout
        );

    }

};