const User = require("../schemas/User");
const Organizer = require("../schemas/Organizer");
const Event = require("../schemas/Event");
const QRCode = require("../schemas/QRCode");

exports.create = async (req, res) => {
    const session = req.session;

    if (session.role !== "organizer") {
        return res.status(401).json({ message: "Not authorized." });
    }

    const user = await User.findOne({ username: session.username });

    const { name, image, description, location, category, startDate, tickets, isQRExternal, status } = req.body;

    if (name.length < 3) {
        return res.status(400).json({ message: "Event name is not valid." });
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

    // find organizer attached to user
    const organizer = await Organizer.findOne({ user: user });

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
            organizer,
            organizerWallet: user.walletAddress,
            isQRExternal,
            status: status
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

    const { name, image, description, location, category, startDate, tickets, isQRExternal, status } = req.body;

    if (name.length < 3) {
        return res.status(400).json({ message: "Event name is not valid." });
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

    event.name = name;
    event.image = image;
    event.description = description;
    event.location = location;
    event.category = category;
    event.startDate = startDate;
    event.tickets = tickets;
    event.isQRExternal = isQRExternal;
    event.status = status;

    try {
        await event.save();

        res.json(event);
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
    const session = req.session;

    const query = req.query;

    const searchCriteria = { ...query };
    const sortCriteria = {};

    if (!session.role || session.role === "user") {
        searchCriteria.status = "published";

        sortCriteria.startDate = -1;
    } else {
        sortCriteria.updatedAt = -1;
    }

    const events = await Event.find(searchCriteria).sort(sortCriteria).exec();

    res.json(events);
};

exports.addQRCodes = async (req, res) => {
    const session = req.session;

    if (session.role !== "organizer") {
        return res.status(401).json({ message: "Not authorized." });
    }

    const id = req.params.id;

    const event = await Event.findById(id);

    if (!event) {
        return res.status(404).json({ message: "Event not found." });
    }

    const qrCodesData = req.body;

    const ticketTypes = Object.keys(qrCodesData);
    const values = Object.values(qrCodesData);

    const qrCodes = [];

    for (let i = 0; i < ticketTypes.length; i++) {
        for (let j = 0; j < values[i].length; j++) {
            const value = values[i][j];
            const ticketType = parseInt(ticketTypes[i]);

            qrCodes.push({ value, ticketType, event: event.id });
        }
    }

    await QRCode.insertMany(qrCodes);

    res.status(201).json({ message: "QR codes successfully added." });
};
