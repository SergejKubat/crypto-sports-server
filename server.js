require("dotenv").config();

const path = require("path");

const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
/*const redis = require("redis");
const connectRedis = require("connect-redis");*/
const cors = require("cors");
const morgan = require("morgan");

const sync = require("./sync");

const AuthRoutes = require("./routes/auth.routes");
const EventRoutes = require("./routes/event.routes");
const InviteRoutes = require("./routes/invite.routes");
const OrganizerRoutes = require("./routes/organizer.routes");
const ResetPasswordRoutes = require("./routes/reset-password.routes");
const TicketRoutes = require("./routes/ticket.routes");
const FileRoutes = require("./routes/file.routes");
const UserRoutes = require("./routes/user.routes");

const PORT = process.env.PORT || 5000;
const ONE_DAY = 1000 * 60 * 60 * 24;

const app = express();

// DATABASES

mongoose.connect(process.env.MONGODB_URI, () => {
    console.log("Database connection established successfully!");
});

/*const RedisStore = connectRedis(session);

const redisClient = redis.createClient({
    host: "localhost",
    port: 6379
});

redisClient.on("error", function (err) {
    console.log("Could not establish a connection with redis. " + err);
});

redisClient.on("connect", function (err) {
    console.log("Connected to redis successfully");
});*/

// MIDDLEWARES
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));
app.use(
    session({
        //store: new RedisStore({ client: redisClient }),
        name: "sessionId",
        secret: process.env.SESSION_SECRET,
        saveUninitialized: false,
        resave: false,
        cookie: { secure: false, maxAge: ONE_DAY }
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

// logger
app.use(morgan("combined"));

// start server
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);

    sync.setupListeners();
});
