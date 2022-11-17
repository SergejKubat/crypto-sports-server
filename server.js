const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
const redis = require("redis");
const connectRedis = require("connect-redis");
const cors = require("cors");
const morgan = require("morgan");

require("dotenv").config();

const AuthRoutes = require("./routes/AuthRoutes");

const PORT = process.env.PORT || 5000;
const ONE_DAY = 1000 * 60 * 60 * 24;

const app = express();

// DATABASES

mongoose.connect(process.env.MONGODB_URI, () => {
    console.log("Database connection established successfully!");
});

const RedisStore = connectRedis(session);

const redisClient = redis.createClient({
    host: "localhost",
    port: 6379
});

redisClient.on("error", function (err) {
    console.log("Could not establish a connection with redis. " + err);
});

redisClient.on("connect", function (err) {
    console.log("Connected to redis successfully");
});

// MIDDLEWARES

// CORS
app.use(cors());

// sessions
app.use(
    session({
        store: new RedisStore({ client: redisClient }),
        secret: process.env.SESSION_SECRET,
        saveUninitialized: false,
        resave: false,
        cookie: { secure: false, maxAge: ONE_DAY }
    })
);

// routes
app.use("/api", AuthRoutes);

// logger
app.use(morgan("combined"));

// start server
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
