const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const EventSchema = new Schema(
    {
        name: String,
        image: { type: String, required: true },
        description: String,
        location: String,
        category: { type: String, required: true },
        startDate: { type: Date, required: true },
        tickets: { type: mongoose.SchemaTypes.Mixed },
        user: { type: mongoose.SchemaTypes.ObjectId, ref: "User" },
        organizer: { type: mongoose.SchemaTypes.ObjectId, ref: "Organizer" },
        organizerWallet: String,
        contractAddress: String,
        isQRExternal: { type: Boolean, default: false },
        status: { type: String, required: true }
    },
    { collection: "Event", timestamps: true }
);

EventSchema.index({ name: "text" });

module.exports = mongoose.model("Event", EventSchema);
