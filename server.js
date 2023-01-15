require("dotenv").config();

const https = require("https");
const fs = require("fs");
const path = require("path");

const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
const { createClient } = require("redis");
const RedisStore = require("connect-redis")(session);
const cors = require("cors");

const sync = require("./sync");

const constants = require("./constants");

const AuthRoutes = require("./routes/auth.routes");
const EventRoutes = require("./routes/event.routes");
const InviteRoutes = require("./routes/invite.routes");
const OrganizerRoutes = require("./routes/organizer.routes");
const ResetPasswordRoutes = require("./routes/reset-password.routes");
const TicketRoutes = require("./routes/ticket.routes");
const FileRoutes = require("./routes/file.routes");
const UserRoutes = require("./routes/user.routes");

const PORT = process.env.PORT || 5000;

const app = express();

// DATABASES
mongoose.connect(process.env.MONGODB_URI, () => {
    console.log("MongoDB connection established successfully!");
});

const redisClient = createClient({ legacyMode: true, host: process.env.REDIS_HOST, port: process.env.REDIS_PORT });

redisClient.connect().catch(console.error);

redisClient.on("connect", function (err) {
    console.log("Redis connection established successfully!");
});

// MIDDLEWARES
app.use(
    cors({
        origin: "http://127.0.0.1:5173",
        credentials: true
    })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));
app.use(
    session({
        store: new RedisStore({ client: redisClient }),
        name: "sessionId",
        secret: process.env.SESSION_SECRET,
        saveUninitialized: false,
        resave: false,
        cookie: { secure: true, maxAge: constants.ONE_DAY, sameSite: "none" }
    })
);

// routes
app.use("/api", AuthRoutes);
app.use("/api/events", EventRoutes);
app.use("/api/invites", InviteRoutes);
app.use("/api/organizers", OrganizerRoutes);
app.use("/api/resetPasswordRequests", ResetPasswordRoutes);
app.use("/api/tickets", TicketRoutes);
app.use("/api/files", FileRoutes);
app.use("/api/users", UserRoutes);

// start server
https
    .createServer(
        {
            key: fs.readFileSync("key.pem"),
            cert: fs.readFileSync("cert.pem")
        },
        app
    )
    .listen(PORT, () => {
        console.log(`Server listening on port ${PORT}`);

        sync.setupListeners();
    });
