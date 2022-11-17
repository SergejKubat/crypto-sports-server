const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const InviteSchema = new Schema(
    {
        email: { type: String, required: true, index: { unique: true } },
        used: { type: Boolean, default: false }
    },
    { collection: "Invite", timestamps: true }
);

module.exports = mongoose.model("Invite", InviteSchema);
