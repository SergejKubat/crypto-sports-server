const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserSchema = new Schema(
    {
        username: { type: String, required: true, index: { unique: true } },
        email: { type: String, required: true, index: { unique: true } },
        walletAddress: String,
        role: { type: String, required: true, default: "user" },
        password: { type: String, required: true },
        verified: { type: Boolean, default: false },
        authMessage: String
    },
    { collection: "User", timestamps: true }
);

UserSchema.statics.findByUsername = function (username) {
    return this.findOne({ username: username });
};

UserSchema.statics.findByEmail = function (email) {
    return this.findOne({ email: email });
};

module.exports = mongoose.model("User", UserSchema);
