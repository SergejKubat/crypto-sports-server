const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const QRCodeSchema = new Schema(
    {
        value: { type: String, required: true },
        ticketType: { type: Number, required: true, min: 0, max: 3 },
        event: mongoose.SchemaTypes.ObjectId,
        ticket: mongoose.SchemaTypes.ObjectId,
    },
    { collection: "QRCode", timestamps: true }
);

module.exports = mongoose.model("QRCode", QRCodeSchema);
