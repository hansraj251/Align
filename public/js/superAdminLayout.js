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
class="fixed left-0 top-0 z-50 flex h-full w-64 -translate-x-full flex-col overflow-y-auto bg-slate-900 text-white transition-transform duration-300 md:static md:translate-x-0">
        <div
            class="p-6 text-2xl font-bold border-b border-slate-700">

            ALIGN

            <div
                class="text-sm font-normal text-slate-300">

                Super Admin

            </div>

        </div>

        <nav class="flex-1 space-y-2 p-4">

    <div>

        <a
    href="/super-admin/dashboard.html"
    class="block rounded-lg px-4 py-3 transition hover:bg-slate-800 ${active === "dashboard" ? "bg-slate-800 font-semibold"

: "hover:bg-slate-800"}">

            Dashboard

        </a>

    </div>

    <div>

        <a
            href="/super-admin/restaurants.html"
            class="block rounded-lg px-4 py-3 transition hover:bg-slate-800 ${active === "restaurants" ? "bg-slate-800 font-semibold"

: "hover:bg-slate-800"}">

            Users

        </a>

    </div>

    <div>

        <a
    href="/super-admin/plans.html"
    class="block rounded-lg px-4 py-3 transition hover:bg-slate-800 ${active === "plans" ? "bg-slate-800 font-semibold"

: "hover:bg-slate-800"}">

    Plans

</a>
</div>
<div>
        <a

href="/super-admin/pricing.html"

class="block rounded-lg px-4 py-3 transition hover:bg-slate-800 ${active === "pricing" ? "bg-slate-800 font-semibold"

: "hover:bg-slate-800"}">

Pricing

</a>

    </div>

</nav>
<div class="border-t border-slate-700 p-4">

<a

href="#"

onclick="SuperAdminAuth.logout(); return false;"

class="block rounded-lg bg-red-600 px-4 py-3 text-center font-medium text-white transition hover:bg-red-700">

Logout

</a>

</div>

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

    

</div>

    <main class="flex h-screen flex-1 flex-col overflow-hidden">

        <header
class="hidden h-20 items-center justify-between bg-white px-6 shadow md:flex">

            <h1
                class="text-3xl font-bold">

                ${title}

            </h1>

            

        </header>

        <div
id="pageContent"
class="flex-1 overflow-y-auto p-4 pt-20 md:p-8">

        </div>
<div id="modalContainer"></div>        

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

    
    loadComponent(
    "modalContainer",
    "/components/modal.html"
);

    overlay.addEventListener("click", () => {

        sidebar.classList.add("-translate-x-full");

        overlay.classList.add("hidden");

    });

}

}