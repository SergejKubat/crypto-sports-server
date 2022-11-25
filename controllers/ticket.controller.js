const User = require("../schemas/User");
const Ticket = require("../schemas/Ticket");
const QRCode = require("../schemas/QRCode");

exports.create = async (tokenId, type, owner, eventAddress) => {
    await Ticket.create({ tokenId, type, owner, eventAddress });
};

exports.getQRCode = async (req, res) => {
    const username = req.session.username;

    const ticketId = req.params.id;

    const ticket = await Ticket.findById(ticketId);

    const { walletAddress, message, signature } = req.body;

    if (!ticket) {
        return res.status(404).json({ message: "Ticket not found." });
    }

    const user = await User.findOne({ username });

    if (walletAddress !== user.walletAddress) {
        return res.status(400).json({ message: "Wrong wallet address." });
    }

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
