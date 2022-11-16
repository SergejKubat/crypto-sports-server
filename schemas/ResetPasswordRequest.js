const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ResetPasswordRequestSchema = new Schema(
    {
        email: { type: String, required: true },
        used: { type: Boolean, default: false },
    },
    { collection: "ResetPasswordRequest", timestamps: true }
);

module.exports = mongoose.model("ResetPasswordRequest", ResetPasswordRequestSchema);
