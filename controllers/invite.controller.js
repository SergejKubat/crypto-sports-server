const validator = require("validator");

const Invite = require("../schemas/Invite");

const constants = require("../constants");

exports.create = async (req, res) => {
    const session = req.session;

    if (session.role !== "admin") {
        return res.status(401).json({ message: "Not authorized." });
    }

    const email = req.body.email;

    if (!validator.isEmail(email)) {
        return res.status(400).json({ message: "Email is not valid." });
    }

    try {
        const invite = await Invite.create({ email });

        //  @TODO: Send invitation email
        const inviteCode = invite.id;

        console.log("Invite code: ", inviteCode);

        res.status(201).json({ message: "Successfully sent invitation." });
    } catch (err) {
        // duplicated key
        if (err.code === 11000) {
            const keyName = Object.keys(err.keyPattern)[0];

            res.status(400).json({ message: `Email ${keyName} already exists.` });
        } else {
            throw new Error(err);
        }
    }
};

exports.delete = async (req, res) => {
    const session = req.session;

    if (session.role !== "admin") {
        return res.status(401).json({ message: "Not authorized." });
    }

    const inviteCode = req.params.code;

    const invite = await Invite.findById(inviteCode);

    if (!invite) {
        return res.status(404).json({ message: "Invite not found." });
    }

    await invite.delete();

    res.json({ message: "Invite is successfully deleted." });
};

exports.getById = async (req, res) => {
    const inviteCode = req.params.code;

    const invite = await Invite.findById(inviteCode);

    if (!invite) {
        return res.status(404).json({ message: "Invite not found." });
    }

    return res.json(invite);
};

exports.getAll = async (req, res) => {
    const type = req.query.type;

    let invites;

    switch (type) {
        case "used": {
            invites = await Invite.find({ used: true }).sort({ updatedAt: -1 }).exec();
            break;
        }
        case "active": {
            const currentDate = new Date();

            currentDate.setTime(currentDate.getTime() - constants.TWO_HOURS);

            invites = await Invite.find({ used: false, createdAt: { $gt: currentDate } })
                .sort({ createdAt: -1 })
                .exec();
            break;
        }
        case "expired": {
            const currentDate = new Date();

            currentDate.setTime(currentDate.getTime() - constants.TWO_HOURS);

            invites = await Invite.find({ used: false, createdAt: { $lt: currentDate } })
                .sort({ createdAt: -1 })
                .exec();
            break;
        }
        default: {
            return res.status(400).json({ message: "Type is not valid." });
        }
    }

    res.json(invites);
};
