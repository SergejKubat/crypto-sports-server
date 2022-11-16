const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const TicketSchema = new Schema(
    {
        tokenId: { type: Number, required: true },
        type: { type: Number, required: true, min: 0, max: 3 },
        owner: { type: String, required: true },
        eventAddress: { type: String, required: true },
        used: { type: Boolean, default: false },
    },
    { collection: "Ticket", timestamps: true }
);

module.exports = mongoose.model("Ticket", TicketSchema);
