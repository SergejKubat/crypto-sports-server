const validator = require("validator");

const User = require("../schemas/User");
const Organizer = require("../schemas/Organizer");

exports.create = async (req, res) => {
    const session = req.session;

    if (session.role !== "organizer") {
        return res.status(401).json({ message: "Not authorized." });
    }

    const user = await User.findOne({ username: session.username });

    const { name, image, description, website, socialMedia } = req.body;

    if (name.length < 3) {
        return res.status(400).json({ message: "Organizer name is not valid." });
    }

    if (!validator.isURL(image)) {
        return res.status(400).json({ message: "Organizer image is not valid." });
    }

    if (!description) {
        return res.status(400).json({ message: "Organizer description is not valid." });
    }

    if (!validator.isURL(website)) {
        return res.status(400).json({ message: "Organizer website is not valid." });
    }

    try {
        const organizer = await Organizer.create({ name, user: user.id, image, description, website, socialMedia });

        res.status(201).json(organizer);
    } catch (err) {
        // duplicated key
        if (err.code === 11000) {
            const keyName = Object.keys(err.keyPattern)[0];

            res.status(400).json({ message: `Event ${keyName} already exists.` });
        } else {
            throw new Error(err);
        }
    }
};

exports.update = async (req, res) => {
    const session = req.session;

    if (session.role !== "organizer") {
        return res.status(401).json({ message: "Not authorized." });
    }

    const id = req.params.id;

    const user = await User.findOne({ username: session.username });
    const organizer = await Organizer.findById(id);

    // check if user created this organizer
    if (user.id !== organizer.user.toString()) {
        return res.status(401).json({ message: "Not authorized." });
    }

    const { name, image, description, website, socialMedia } = req.body;

    if (name.length < 3) {
        return res.status(400).json({ message: "Organizer name is not valid." });
    }

    if (!validator.isURL(image)) {
        return res.status(400).json({ message: "Organizer image is not valid." });
    }

    if (!description) {
        return res.status(400).json({ message: "Organizer description is not valid." });
    }

    if (!validator.isURL(website)) {
        return res.status(400).json({ message: "Organizer website is not valid." });
    }

    organizer.name = name;
    organizer.image = image;
    organizer.description = description;
    organizer.website = website;
    organizer.socialMedia = socialMedia;

    try {
        await organizer.save();

        res.json(organizer);
    } catch (err) {
        // duplicated key
        if (err.code === 11000) {
            const keyName = Object.keys(err.keyPattern)[0];

            res.status(400).json({ message: `Event ${keyName} already exists.` });
        } else {
            throw new Error(err);
        }
    }

    // social media
    //organizer.socialMedia.set('');

    //res.send("Not implemented yet!");
};

exports.getById = async (req, res) => {
    const id = req.params.id;

    const organizer = await Organizer.findById(id);

    if (!organizer) {
        return res.status(404).json({ message: "Organizer not found" });
    }

    res.json(organizer);
};

exports.getAll = async (req, res) => {
    const organizer = await Organizer.find().sort({ createdAt: 1 }).exec();

    res.json(organizer);
};

// @TODO: All events

// @TODO: All reviews
