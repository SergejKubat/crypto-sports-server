const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const QRCodeSchema = new Schema(
    {
        value: { type: String, required: true },
        ticketType: { type: Number, required: true, min: 0, max: 3 },
        event: { type: mongoose.SchemaTypes.ObjectId, ref: "Event" },
        ticket: { type: mongoose.SchemaTypes.ObjectId, ref: "Ticket" },
    },
    { collection: "QRCode", timestamps: true }
);

module.exports = mongoose.model("QRCode", QRCodeSchema);
