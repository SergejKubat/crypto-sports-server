const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const EventSchema = new Schema(
    {
        name: { type: "String", required: true, index: { unique: true } },
        permalink: { type: "String", required: true },
        image: { type: "String", required: true },
        description: { type: "String" },
        location: { type: "String" },
        category: { type: "String", required: true },
        startDate: { type: "Date", required: true },
        organizerWallet: { type: "String" },
        contractAddress: { type: "String" },
        isQRExternal: { type: "Boolean", required: true },
        status: { type: "String", required: true },
        createdAt: { type: "Date", default: Date.now },
    },
    { collection: "Event" }
);

module.exports = mongoose.model("SportEvent", EventSchema);
