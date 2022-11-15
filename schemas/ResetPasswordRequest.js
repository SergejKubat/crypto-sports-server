const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ResetPasswordRequestSchema = new Schema(
    {
        email: { type: "String", required: true },
        used: { type: "Boolean", default: false },
        createdAt: { type: "Date", default: Date.now },
    },
    { collection: "ResetPasswordRequest" }
);

module.exports = mongoose.model("ResetPasswordRequest", ResetPasswordRequestSchema);
