(() => {
    "use strict";

    const sidebar =
        document.getElementById("ledgerSidebar");

    const overlay =
        document.getElementById("ledgerSidebarOverlay");

    const openButton =
        document.getElementById("ledgerSidebarButton");

    const closeButton =
        document.getElementById("ledgerSidebarClose");

    const profileButton =
        document.getElementById("ledgerProfileButton");

    const logoutButton =
        document.getElementById("ledgerSidebarLogout");

    function openSidebar() {
        if (sidebar) {
            sidebar.classList.add("open");
        }

        if (overlay) {
            overlay.hidden = false;
        }

        document.body.classList.add("sidebar-open");
    }

    function closeSidebar() {
        if (sidebar) {
            sidebar.classList.remove("open");
        }

        if (overlay) {
            overlay.hidden = true;
        }

        document.body.classList.remove("sidebar-open");
    }

    if (openButton) {
        openButton.addEventListener(
            "click",
            openSidebar
        );
    }

    if (closeButton) {
        closeButton.addEventListener(
            "click",
            closeSidebar
        );
    }

    if (overlay) {
        overlay.addEventListener(
            "click",
            closeSidebar
        );
    }

    if (profileButton) {
        profileButton.addEventListener(
            "click",
            () => {
                window.location.href =
                    "/ledger/profile.html";
            }
        );
    }

    if (logoutButton) {
        logoutButton.addEventListener(
            "click",
            () => {
                if (
                    window.Auth &&
                    typeof Auth.logout === "function"
                ) {
                    Auth.logout(
                        "/ledger/login.html"
                    );
                    return;
                }

                localStorage.removeItem("token");

                window.location.href =
                    "/ledger/login.html";
            }
        );
    }
})();
