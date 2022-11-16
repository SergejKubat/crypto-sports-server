const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");

require("dotenv").config();

const app = express();

// MIDDLEWARES

app.use(cors());
app.use(morgan("combined"));

// DATABASES

mongoose.connect(process.env.MONGODB_URI, () => {
    console.log("Database connection established successfully!");
});

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
