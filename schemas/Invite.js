const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const InviteSchema = new Schema(
    {
        email: { type: "String", required: true, index: { unique: true } },
        used: { type: "Boolean", default: false },
        createdAt: { type: "Date", default: Date.now },
    },
    { collection: "Invite" }
);

module.exports = mongoose.model("Invite", InviteSchema);
