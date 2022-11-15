const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const OrganizerSchema = new Schema(
    {
        name: { type: "String", required: true, index: { unique: true } },
        image: { type: "String" },
        description: { type: "String" },
        website: { type: "String" },
        socialMedia: { type: "Map", of: "String" },
        createdAt: { type: "Date", default: Date.now },
    },
    { collection: "Organizer" }
);

module.exports = mongoose.model("Organizer", OrganizerSchema);
