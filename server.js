require("dotenv").config();

const http =
    require("http");

require("./db");

const path =
    require("path");

const express =
    require("express");

const cors =
    require("cors");

const initializeDatabase =
    require("./database/init");

const app =
    express();

const server =
    http.createServer(app);

app.use(cors());

app.use(
    "/api/subscription/webhook",
    express.raw({
        type: "application/json"
    })
);

app.use(
    express.json()
);

app.use(
    express.urlencoded({
        extended: true
    })
);

app.use(
    express.static("public")
);

const uploadsPath =
    process.env.RENDER
        ? "/var/data/uploads"
        : path.join(
            __dirname,
            "uploads"
        );

app.use(
    "/uploads",
    express.static(
        uploadsPath
    )
);

/* -------------------- ROUTES -------------------- */

app.use(
    "/api/auth",
    require("./routes/authRoutes")
);

app.use(
    "/api/restaurants",
    require("./routes/restaurantRoutes")
);

app.use(
    "/api/subscription",
    require("./routes/subscriptionRoutes")
);

app.use(
    "/api/super-admin",
    require("./routes/superAdminRoutes")
);

app.use(
    "/api/super-admin/accounts",
    require("./routes/superAdminAccountRoutes")
);

app.use(
    "/api/pos",
    require("./routes/posAuthRoutes")
);

app.use(
    "/api/pos",
    require("./routes/posRoutes")
);

app.get(
    "/",
    (
        req,
        res
    ) => {

        res.redirect(
            "/login.html"
        );

    }
);

initializeDatabase()

    .then(() => {

        const PORT =
            process.env.PORT
            || 3000;

        server.listen(
            PORT,
            () => {

                console.log(
                    `🚀 Align Cloud running on http://localhost:${PORT}`
                );

            }
        );

    })

    .catch(
        console.error
    );