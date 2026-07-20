function playNotificationSound() {

    const audio = new Audio("/sounds/notification.mp3");

    audio.volume = 1;

    audio.play().catch(() => {});

}

function showSocketNotification(title, message) {

    const box = document.createElement("div");

    box.className =
        "fixed top-5 right-5 z-[9999] w-80 rounded-xl bg-blue-600 p-4 text-white shadow-2xl transition";

    box.innerHTML = `

<div class="font-bold text-lg">

${title}

</div>

<div class="mt-1 text-sm">

${message}

</div>

`;

    document.body.appendChild(box);

    playNotificationSound();

    setTimeout(() => {

        box.remove();

    }, 5000);

}