const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserSchema = new Schema(
    {
        username: { type: String, required: true, index: { unique: true } },
        email: { type: String, required: true, index: { unique: true } },
        walletAddress: String,
        avatar: String,
        role: { type: String, required: true, default: "user" },
        password: { type: String, required: true },
        verified: { type: Boolean, default: false },
    },
    { collection: "User", timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
