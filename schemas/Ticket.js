const mongoose = require("mongoose");

const QRCode = require("./QRCode");

const Schema = mongoose.Schema;

const TicketSchema = new Schema(
    {
        tokenId: { type: Number, required: true },
        type: { type: Number, required: true, min: 0, max: 3 },
        owner: { type: String, required: true },
        eventAddress: { type: String, required: true },
        event: { type: mongoose.SchemaTypes.ObjectId, ref: "Event" },
        used: { type: Boolean, default: false }
    },
    { collection: "Ticket", timestamps: true }
);

TicketSchema.post("save", async (ticket) => {
    const qrCode = await QRCode.findOne({ ticket: { $exists: false }, ticketType: ticket.type, event: ticket.event });

    if (!qrCode) {
        return;
    }

    // set ticket to qr code
    qrCode.ticket = ticket.id;

    qrCode.save();
});

module.exports = mongoose.model("Ticket", TicketSchema);
