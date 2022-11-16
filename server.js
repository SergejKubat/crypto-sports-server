const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
const redis = require("redis");
const connectRedis = require("connect-redis");
const cors = require("cors");
const morgan = require("morgan");

require("dotenv").config();

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
    port: 6379,
});

redisClient.on("error", function (err) {
    console.log("Could not establish a connection with redis. " + err);
});

redisClient.on("connect", function (err) {
    console.log("Connected to redis successfully");
});

// MIDDLEWARES

app.use(cors());

app.use(
    session({
        store: new RedisStore({ client: redisClient }),
        secret: process.env.SESSION_SECRET,
        saveUninitialized: false,
        resave: false,
        cookie: { secure: false, maxAge: ONE_DAY },
    })
);

app.use(morgan("combined"));

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
