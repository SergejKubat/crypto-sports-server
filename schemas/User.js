const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserSchema = new Schema(
    {
        username: { type: "String", required: true, index: { unique: true } },
        email: { type: "String", required: true, index: { unique: true } },
        walletAddress: { type: "String" },
        avatar: { type: "String" },
        role: { type: "String", required: true, default: "user" },
        password: { type: "String", required: true },
        verified: { type: "Boolean", default: false },
        createdAt: { type: "Date", default: Date.now },
    },
    { collection: "User" }
);

module.exports = mongoose.model("User", UserSchema);
