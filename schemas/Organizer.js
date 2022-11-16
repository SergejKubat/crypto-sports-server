const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const OrganizerSchema = new Schema(
    {
        name: { type: String, required: true, index: { unique: true } },
        user: mongoose.SchemaTypes.ObjectId,
        image: String,
        description: String,
        website: String,
        socialMedia: { type: mongoose.SchemaTypes.Map, of: String },
    },
    { collection: "Organizer", timestamps: true }
);

module.exports = mongoose.model("Organizer", OrganizerSchema);
