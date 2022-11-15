const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const QRCodeSchema = new Schema(
    {
        value: { type: "String", required: true },
        ticketType: { type: "Number", required: true },
        event: mongoose.Types.ObjectId,
        ticket: mongoose.Types.ObjectId,
        createdAt: { type: "Date", default: Date.now },
    },
    { collection: "QRCode" }
);

module.exports = mongoose.model("QRCode", QRCodeSchema);
