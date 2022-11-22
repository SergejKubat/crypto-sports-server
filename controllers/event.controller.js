const validator = require("validator");

const User = require("../schemas/User");
const Event = require("../schemas/Event");

exports.create = async (req, res) => {
    const session = req.session;

    if (session.role !== "organizer") {
        return res.status(401).json({ message: "Not authorized." });
    }

    const user = await User.findOne({ username: session.username });

    const { name, image, description, location, category, startDate, tickets, isQRExternal } = req.body;

    if (name.length < 3) {
        return res.status(400).json({ message: "Event name is not valid." });
    }

    if (!validator.isURL(image)) {
        return res.status(400).json({ message: "Event image is not valid." });
    }

    if (!description) {
        return res.status(400).json({ message: "Event description is not valid." });
    }

    if (!location) {
        return res.status(400).json({ message: "Event location is not valid." });
    }

    if (!category) {
        return res.status(400).json({ message: "Event category is not valid." });
    }

    if (!startDate) {
        return res.status(400).json({ message: "Event date is not valid." });
    }

    if (!tickets) {
        return res.status(400).json({ message: "Event tickets are not valid." });
    }

    try {
        const event = await Event.create({
            name,
            image,
            description,
            location,
            category,
            startDate,
            tickets,
            user: user.id,
            organizerWallet: user.walletAddress,
            isQRExternal,
            status: "draft"
        });

        res.status(201).json(event);
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

    if (session.role !== "organizer" && session.role !== "admin") {
        return res.status(401).json({ message: "Not authorized." });
    }

    const id = req.params.id;

    const user = await User.findOne({ username: session.username });
    const event = await Event.findById(id);

    // check if user created this event
    if (user.id !== event.user.toString()) {
        return res.status(401).json({ message: "Not authorized." });
    }

    res.send("Not implemented yet!");
};

exports.delete = async (req, res) => {
    const session = req.session;

    if (session.role !== "organizer") {
        return res.status(401).json({ message: "Not authorized." });
    }

    const id = req.params.id;

    const user = await User.findOne({ username: session.username });
    const event = await Event.findById(id);

    // check if user created this event
    if (user.id !== event.user.toString()) {
        return res.status(401).json({ message: "Not authorized." });
    }

    if (event.status === "published") {
        return res.status(400).json({ message: "Cannot delete published event." });
    }

    await event.delete();

    res.json({ message: "Event is successfully deleted." });
};

exports.getById = async (req, res) => {
    const id = req.params.id;

    try {
        const event = await Event.findById(id);

        return res.json(event);
    } catch (error) {
        return res.status(404).json({ message: "Event not found." });
    }
};

exports.getAll = async (req, res) => {
    const events = await Event.find({ status: "published" }).sort({ startDate: -1 }).exec();

    res.json(events);
};