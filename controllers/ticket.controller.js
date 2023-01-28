const Web3 = require("web3");

const User = require("../schemas/User");
const Ticket = require("../schemas/Ticket");
const Event = require("../schemas/Event");
const QRCode = require("../schemas/QRCode");

const SportEvent = require("../abi/SportEvent.json");

const web3 = new Web3(new Web3.providers.HttpProvider(process.env.PROVIDER_HTTP_URL));

exports.create = async (tokenId, type, owner, eventAddress) => {
    const event = await Event.findOne({ contractAddress: eventAddress }).exec();

    if (!event) {
        throw new Error("Event not found.");
    }

    await Ticket.create({ tokenId, type, owner: owner.toLowerCase(), eventAddress, event });
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

    const { walletAddress, signature } = req.body;

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

    // verify signature
    const message = `Wallet: ${walletAddress}`;

    const recoverAddress = web3.eth.accounts.recover(message, signature).toLowerCase();

    if (walletAddress !== recoverAddress) {
        return res.status(400).json({ message: "Invalid signature." });
    }

    // verify ownership in contract
    const eventAddress = ticket.eventAddress;

    const tokenId = ticket.tokenId;

    // create contract instance
    const SportEvent = new web3.eth.Contract(SportEvent.abi, eventAddress);

    SportEvent.methods
        .ownerOf(tokenId)
        .call()
        .then(async (data) => {
            console.log("DATA: ", data);

            const qrCode = await QRCode.findOne({ ticket: ticket.id });

            if (!qrCode) {
                return res.status(404).json({ message: "QR Code not found." });
            }

            // mark ticket as used
            ticket.used = true;

            await ticket.save();

            res.json({ code: qrCode.value });
        })
        .catch((error) => {
            console.log("ERROR: ", error);

            return res.status(404).json({ message: "Wallet address is not ticket owner." });
        });
};
