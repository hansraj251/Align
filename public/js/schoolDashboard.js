Auth.requireSchoolOwner();

async function loadSchool() {

    try {

        const data =
            await API.get(
                "/api/schools/me"
            );

        if (
            !data.success
        ) {

            throw new Error(
                data.message
            );

        }

        const school =
            data.school;

        document.getElementById(
            "schoolName"
        ).textContent =
            school.name;
        const sidebarSchoolLogo =
    document.getElementById(
        "sidebarSchoolLogo"
    );

if (
    school.logo
) {

    sidebarSchoolLogo.src =
        school.logo;

    sidebarSchoolLogo.classList.remove(
        "hidden"
    );

}


    }
    catch (err) {

        console.error(err);

        window.location.href =
            "/login.html";

    }

}

async function loadClasses() {

    try {

        const today =
    new Date()
        .toISOString()
        .split("T")[0];

const data =
    await API.get(
        `/api/classes/attendance-summary?date=${today}`
    );

        if (
            !data.success
        ) {

            throw new Error(
                data.message ||
                "Unable to load classes"
            );

        }

        const activeClasses =
    data.classes;

        const classesContainer =
            document.getElementById(
                "dashboardClasses"
            );

        if (
            !classesContainer
        ) {

            return;

        }

        if (
            !activeClasses.length
        ) {

            classesContainer.innerHTML = `

                <p
                    class="text-sm text-slate-500">

                    No active classes found.

                </p>

            `;

            return;

        }

        classesContainer.innerHTML =
    activeClasses.map(
        classItem => `

            <a
    href="/school/attendance.html?classId=${encodeURIComponent(
        classItem.id
    )}"
                class="rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-1 hover:bg-white hover:shadow-md">

                <div
                    class="flex items-start justify-between gap-3">

                    <div>

                        <p
                            class="text-base font-semibold text-slate-800">

                            ${classItem.name || "-"}

                        </p>

                        <p
                            class="mt-1 text-sm text-slate-500">

                            Section:
                            ${classItem.section || "-"}

                        </p>

                    </div>

                </div>


                ${
    classItem.isHoliday

    ?

    `
        <div
            class="mt-4 rounded-lg bg-amber-50 p-3 text-center">

            <p
                class="text-xs font-medium text-amber-600">

                Today

            </p>

            <p
                class="mt-1 text-lg font-bold text-amber-700">

                Holiday

            </p>

        </div>
    `

    :

    `
        <div
            class="mt-4 grid grid-cols-2 gap-2">


            <div
                class="rounded-lg bg-emerald-50 p-2 text-center">

                <p
                    class="text-xs text-emerald-600">

                    Present

                </p>

                <p
                    class="mt-1 text-lg font-bold text-emerald-700">

                    ${
                        classItem.presentStudents ||
                        0
                    }

                </p>

            </div>


            <div
                class="rounded-lg bg-red-50 p-2 text-center">

                <p
                    class="text-xs text-red-600">

                    Absent

                </p>

                <p
                    class="mt-1 text-lg font-bold text-red-700">

                    ${
                        classItem.absentStudents ||
                        0
                    }

                </p>

            </div>

        </div>
    `
}

            </a>

        `
    ).join("");

    }
    catch (err) {

        console.error(err);

        const classesContainer =
            document.getElementById(
                "dashboardClasses"
            );

        if (
            classesContainer
        ) {

            classesContainer.innerHTML = `

                <p
                    class="text-sm text-red-600">

                    Unable to load classes.

                </p>

            `;

        }

    }

}

async function loadStudentCount() {

    try {

        const data =
            await API.get(
                "/api/students"
            );

        if (
            !data.success
        ) {

            throw new Error(
                data.message ||
                "Unable to load students"
            );

        }

        const activeStudents =
    data.students.filter(
        student =>
            student.status ===
            "active"
    );

const studentsCount =
    document.querySelector(
        "#studentsCount"
    );

if (
    studentsCount
) {

    studentsCount.textContent =
        activeStudents.length;

}

    }
    catch (err) {

        console.error(err);

    }

}
async function loadTodayAttendance() {

    try {

        const data =
            await API.get(
                "/api/attendance/today"
            );

        if (
            !data.success
        ) {

            throw new Error(
                data.message ||
                "Unable to load today's attendance"
            );

        }

        const attendanceElement =
            document.getElementById(
                "todayAttendance"
            );

        if (
            attendanceElement
        ) {

            attendanceElement.textContent =
    `${Number(
        data.attendancePercentage || 0
    ).toFixed(1)}%`;

        }

    }
    catch (err) {

        console.error(err);

        const attendanceElement =
            document.getElementById(
                "todayAttendance"
            );

        if (
            attendanceElement
        ) {

            attendanceElement.textContent =
                "--";

        }

    }

}
function getCurrentAcademicYear() {

    const today =
        new Date();

    const year =
        today.getFullYear();

    const month =
        today.getMonth() + 1;

    const startYear =
        month >= 4
            ? year
            : year - 1;

    return `${startYear}-${String(
        startYear + 1
    ).slice(-2)}`;
}

async function loadPendingFees() {

    try {

        const academicYear =
            getCurrentAcademicYear();

        const data =
            await API.get(
                "/api/fee-payments/pending"
            );

        if (
            !data.success
        ) {

            throw new Error(
                data.message ||
                "Unable to load pending fees"
            );

        }

        const pendingFees =
            document.getElementById(
                "pendingFees"
            );

        if (
            pendingFees
        ) {

            pendingFees.textContent =
                `₹${Number(
                    data.pendingAmount || 0
                ).toLocaleString(
                    "en-IN"
                )}`;

        }

    }
    catch (err) {

        console.error(err);

        const pendingFees =
            document.getElementById(
                "pendingFees"
            );

        if (
            pendingFees
        ) {

            pendingFees.textContent =
                "₹0";

        }

    }
}
async function loadPendingSalaries() {

    try {

        const data =
            await API.get(
                "/api/salary-payments/pending"
            );

        if (
            !data.success
        ) {

            throw new Error(
                data.message ||
                "Unable to load pending salaries"
            );

        }

        const pendingSalaries =
            document.getElementById(
                "pendingSalaries"
            );

        if (
            pendingSalaries
        ) {

            pendingSalaries.textContent =
                `₹${Number(
                    data.pendingAmount || 0
                ).toLocaleString(
                    "en-IN"
                )}`;

        }

    }
    catch (err) {

        console.error(err);

        const pendingSalaries =
            document.getElementById(
                "pendingSalaries"
            );

        if (
            pendingSalaries
        ) {

            pendingSalaries.textContent =
                "₹0";

        }

    }

}
async function loadStaffCount() {

    try {

        const data =
            await API.get(
                "/api/teachers"
            );

        if (
            !data.success
        ) {

            throw new Error(
                data.message ||
                "Unable to load staff"
            );

        }

        const activeStaff =
            data.teachers.filter(
                teacher =>
                    teacher.status ===
                    "active"
            );

        const staffCount =
            document.querySelector(
                "#staffCount"
            );

        if (
            staffCount
        ) {

            staffCount.textContent =
                activeStaff.length;

        }

    }
    catch (err) {

        console.error(err);

        const staffCount =
            document.querySelector(
                "#staffCount"
            );

        if (
            staffCount
        ) {

            staffCount.textContent =
                "0";

        }

    }

}

document.getElementById(
    "logoutBtn"
).addEventListener(
    "click",
    () => {

        Auth.logout();

    }
);

loadSchool();
loadClasses();
loadStudentCount();
loadStaffCount();
loadTodayAttendance();
loadPendingFees();
loadPendingSalaries();
window.addEventListener(
    "pageshow",
    () => {

        loadClasses();

    }
);

setInterval(
    () => {

        loadTodayAttendance();

        loadClasses();
        loadPendingFees();
        loadPendingSalaries();

    },
    10000
);