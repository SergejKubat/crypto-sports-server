const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const EventSchema = new Schema(
    {
        name: { type: String, required: true, index: { unique: true } },
        image: { type: String, required: true },
        description: String,
        location: String,
        category: { type: String, required: true },
        startDate: { type: Date, required: true },
        user: { type: mongoose.SchemaTypes.ObjectId, ref: "User" },
        organizerWallet: String,
        contractAddress: String,
        isQRExternal: { type: Boolean, default: false },
        status: { type: String, required: true }
    },
    { collection: "Event", timestamps: true }
);

module.exports = mongoose.model("Event", EventSchema);
