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

exports.update = async (req, res) => {
    const username = req.session.username;

    const ticketId = req.params.id;

    const recieverAddress = req.body.recieverAddress.toLowerCase();

    const user = await User.findOne({ username: username });

    const ticket = await Ticket.findById(ticketId);

    if (user.walletAddress !== ticket.owner) {
        return res.status(400).json({ message: "User is not ticket owner." });
    }

    ticket.owner = recieverAddress;

    await ticket.save();

    res.json(ticket);
};

exports.getPurchasedTickets = async (req, res) => {
    const username = req.session.username;

    const user = await User.findOne({ username });

    const tickets = await Ticket.find({ owner: user.walletAddress }).sort({ createdAt: 1 }).populate("event").exec();

    res.json(tickets);
};

exports.getEventTickets = async (req, res) => {
    const eventId = req.params.id;

    const tickets = await Ticket.find({ event: eventId }).sort({ createdAt: 1 }).exec();

    res.json(tickets);
};

exports.getQRCode = async (req, res) => {
    const ticketId = req.params.id;

    const { walletAddress, signature } = req.body;

    const ticket = await Ticket.findById(ticketId).populate("event").exec();

    // check if ticket exsist
    if (!ticket) {
        return res.status(404).json({ message: "Ticket not found." });
    }

    // check user wallet address
    if (ticket.owner !== walletAddress) {
        return res.status(400).json({ message: "Provided wallet is not ticket owner." });
    }

    // check if ticket is used
    if (ticket.used) {
        return res.status(400).json({ message: "Ticket is already used." });
    }

    // verify signature
    const message = `In order to see the QR code, you must sign this message first.\n\nNonce: ${ticketId}`;

    const recoverAddress = web3.eth.accounts.recover(message, signature).toLowerCase();

    if (walletAddress !== recoverAddress) {
        return res.status(400).json({ message: "Invalid signature." });
    }

    // verify ownership in contract
    const eventAddress = ticket.eventAddress;

    const tokenId = ticket.tokenId;

    // create contract instance
    const SportEventContract = new web3.eth.Contract(SportEvent.abi, eventAddress);

    SportEventContract.methods
        .ownerOf(tokenId)
        .call()
        .then(async (ownerAddress) => {
            if (walletAddress !== ownerAddress.toLowerCase()) {
                return res.status(400).json({ message: "Provided wallet is not ticket owner." });
            }

            // check QR Code type on event
            const isQRExternal = ticket.event.isQRExternal;

            let code;

            if (isQRExternal) {
                const qrCode = await QRCode.findOne({ ticket: ticket.id });

                if (!qrCode) {
                    return res.status(404).json({ message: "QR Code not found." });
                }

                code = qrCode.value;
            } else {
                code = ticket.id;
            }

            // mark ticket as used
            ticket.used = true;

            await ticket.save();

            res.json({ code: code });
        })
        .catch((error) => {
            console.log("ERROR: ", error);

            return res.status(404).json({ message: "Wallet address is not ticket owner." });
        });
};
