const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ReviewSchema = new Schema(
    {
        user: { type: mongoose.SchemaTypes.ObjectId, ref: "User" },
        organizer: { type: mongoose.SchemaTypes.ObjectId, ref: "Organizer" },
        rating: { type: Number, required: true, min: 1, max: 5 },
        description: { type: String, required: true }
    },
    { collection: "Review", timestamps: true }
);

module.exports = mongoose.model("Review", ReviewSchema);
