(function () {

    async function sendHeartbeat() {

        const token = localStorage.getItem("staffToken");

        if (!token) {
            return;
        }

        try {

            await fetch("/api/staff-auth/heartbeat", {

                method: "POST",

                headers: {
                    Authorization: "Bearer " + token
                }

            });

        } catch (err) {

            console.error("Heartbeat failed", err);

        }

    }

    // Pehla heartbeat login ke turant baad
    sendHeartbeat();

    // Har 60 second
    setInterval(sendHeartbeat, 60000);

})();