const User = require("../schemas/User");
const Ticket = require("../schemas/Ticket");
const Event = require("../schemas/Event");
const QRCode = require("../schemas/QRCode");

exports.create = async (tokenId, type, owner, eventAddress) => {
    const event = await Event.findOne({ contractAddress: eventAddress }).exec();

    if (!event) {
        throw new Error("Event not found.");
    }

    await Ticket.create({ tokenId, type, owner, eventAddress, event });
};

exports.getPurchasedTickets = async (req, res) => {
    const username = req.session.username;

    const user = await User.findOne({ username });

    const tickets = await Ticket.find({ owner: user.walletAddress }).sort({ createdAt: -1 }).populate("event").exec();

    res.json(tickets);
};

exports.getQRCode = async (req, res) => {
    const username = req.session.username;

    const ticketId = req.params.id;

    const ticket = await Ticket.findById(ticketId);

    const walletAddress = req.body.walletAddress;

    // check if ticket exsist
    if (!ticket) {
        return res.status(404).json({ message: "Ticket not found." });
    }

    // check if ticket is used
    if (ticket.used) {
        return res.status(400).json({ message: "Ticket is already used." });
    }

    const user = await User.findOne({ username });

    // check user wallet address
    if (walletAddress !== user.walletAddress) {
        return res.status(400).json({ message: "Wrong wallet address." });
    }

    if (ticket.owner !== walletAddress) {
        return res.status(400).json({ message: "Provided wallet is not ticket owner." });
    }

    // @TODO: verify ownership in contract

    // @TODO: verify signature

    const qrCode = await QRCode.findOne({ ticket: ticket.id });

    if (!qrCode) {
        return res.status(404).json({ message: "QR Code not found." });
    }

    // mark ticket as used
    ticket.used = true;

    await ticket.save();

    res.json({ code: qrCode.value });
};
