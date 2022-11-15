const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const TicketSchema = new Schema(
    {
        tokenId: { type: "Number", required: true },
        type: { type: "Number", required: true },
        owner: { type: "String", required: true },
        eventAddress: { type: "String", required: true },
        used: { type: "Boolean", default: false },
        createdAt: { type: "Date", default: Date.now },
    },
    { collection: "Ticket" }
);

module.exports = mongoose.model("Ticket", TicketSchema);
