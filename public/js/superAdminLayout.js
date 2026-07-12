function loadSuperAdminLayout(title) {

    document.body.innerHTML = `

<div class="flex min-h-screen bg-slate-100">

    <aside
        class="w-64 bg-slate-900 text-white">

        <div
            class="p-6 text-2xl font-bold border-b border-slate-700">

            ALIGN

            <div
                class="text-sm font-normal text-slate-300">

                Super Admin

            </div>

        </div>

        <nav class="p-4 space-y-2">

            <a
                href="/super-admin/dashboard.html"
                class="block rounded-lg px-4 py-3 hover:bg-slate-800">

                Dashboard

            </a>

            <a
                href="/super-admin/restaurants.html"
                class="block rounded-lg px-4 py-3 hover:bg-slate-800">

                Restaurants

            </a>

            <a
                href="#"
                class="block rounded-lg px-4 py-3 hover:bg-slate-800">

                Plans

            </a>

            <a
                href="#"
                class="block rounded-lg px-4 py-3 hover:bg-slate-800">

                Devices

            </a>

            <a
                href="#"
                class="block rounded-lg px-4 py-3 hover:bg-slate-800">

                Settings

            </a>

        </nav>

    </aside>

    <main class="flex-1">

        <header
            class="flex items-center justify-between bg-white p-6 shadow">

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
            class="p-8">

        </div>

    </main>

</div>

`;

}