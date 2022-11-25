const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const OrganizerSchema = new Schema(
    {
        name: { type: String, required: true, index: { unique: true } },
        user: { type: mongoose.SchemaTypes.ObjectId, ref: "User", index: { unique: true } },
        image: String,
        description: String,
        website: String,
        socialMedia: { type: mongoose.SchemaTypes.Map, of: String }
    },
    { collection: "Organizer", timestamps: true }
);

module.exports = mongoose.model("Organizer", OrganizerSchema);
