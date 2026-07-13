function loadSuperAdminLayout(options) {

    const title = options.title;

    const active = options.active;


    document.body.innerHTML = `

<div class="flex h-screen bg-slate-100 overflow-hidden">

<div
    id="sidebarOverlay"
    class="fixed inset-0 z-40 hidden bg-black/50 md:hidden">
</div>

    <aside
    id="sidebar"
    class="fixed left-0 top-0 z-50 h-full w-64 -translate-x-full bg-slate-900 text-white transition-transform duration-300 md:static md:translate-x-0 md:flex md:flex-col">
        <div
            class="p-6 text-2xl font-bold border-b border-slate-700">

            ALIGN

            <div
                class="text-sm font-normal text-slate-300">

                Super Admin

            </div>

        </div>

        <nav class="flex-1 overflow-y-auto p-4">

    <div class="mb-6">

        <div class="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Dashboard
        </div>

        <a
    href="/super-admin/dashboard.html"
    class="block rounded-lg px-4 py-3 transition hover:bg-slate-800 ${active === "dashboard" ? "bg-slate-800" : ""}">

            Dashboard

        </a>

    </div>

    <div class="mb-6">

        <div class="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Restaurant Management
        </div>

        <a
            href="/super-admin/restaurants.html"
            class="block rounded-lg px-4 py-3 transition hover:bg-slate-800 ${active === "restaurants" ? "bg-slate-800" : ""}">

            Restaurants

        </a>

    </div>

    <div class="mb-6">

        <div class="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Subscription
        </div>

        <a
            href="#"
            class="block rounded-lg px-4 py-3 transition hover:bg-slate-800">

            Plans

        </a>

        <a
            href="#"
            class="mt-1 block rounded-lg px-4 py-3 transition hover:bg-slate-800">

            Pricing

        </a>

    </div>

    <div class="mb-6">

        <div class="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Monitoring
        </div>

        <a
            href="#"
            class="block rounded-lg px-4 py-3 transition hover:bg-slate-800">

            Active Devices

        </a>

    </div>

    <div>

        <div class="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
            System
        </div>

        <a
            href="#"
            class="block rounded-lg px-4 py-3 transition hover:bg-slate-800">

            Settings

        </a>

    </div>

</nav>

    </aside>

    <div class="fixed top-0 left-0 right-0 z-40 flex h-16 items-center justify-between bg-white px-4 shadow md:hidden">

    <button
        id="menuButton"
        class="rounded-lg p-2">

        ☰

    </button>

    <div class="text-lg font-bold">

        ALIGN

    </div>

    <button
        onclick="SuperAdminAuth.logout()"
        class="rounded-lg bg-red-600 px-3 py-2 text-sm text-white">

        Logout

    </button>

</div>

    <main class="flex-1 overflow-y-auto">

        <header
    class="hidden md:flex items-center justify-between bg-white p-6 shadow">

            <h1
                class="text-3xl font-bold">

                ${title}

            </h1>

            <button
                onclick="SuperAdminAuth.logout()"
                class="rounded-lg bg-red-600 px-4 py-2 text-white">

                Logout

            </button>

        </header>

        <div
    id="pageContent"
    class="p-4 pt-20 md:p-8">

        </div>

    </main>

</div>

`;
const menuButton =
    document.getElementById("menuButton");

const sidebar =
    document.getElementById("sidebar");

const overlay =
    document.getElementById("sidebarOverlay");

if (menuButton && sidebar && overlay) {

    menuButton.addEventListener("click", () => {

        sidebar.classList.remove("-translate-x-full");

        overlay.classList.remove("hidden");

    });

    overlay.addEventListener("click", () => {

        sidebar.classList.add("-translate-x-full");

        overlay.classList.add("hidden");

    });

}

}