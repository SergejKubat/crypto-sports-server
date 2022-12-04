const validator = require("validator");
const bcrypt = require("bcrypt");

const utils = require("../utils/format");

const User = require("../schemas/User");
const Invite = require("../schemas/Invite");
const ResetPasswordRequest = require("../schemas/ResetPasswordRequest");

exports.register = async (req, res) => {
    const session = req.session;

    if (session.username) {
        return res.status(400).json({ message: "Already logged in." });
    }

    const { username, email, password, inviteCode } = req.body;

    if (username.length < 3) {
        return res.status(400).json({ message: "Username is not valid." });
    }

    if (!validator.isEmail(email)) {
        return res.status(400).json({ message: "Email is not valid." });
    }

    if (!validator.isStrongPassword(password)) {
        return res.status(400).json({ message: "Password is not valid." });
    }

    // check if user trying to register as organizer
    let invite;

    if (inviteCode) {
        invite = await Invite.findById(inviteCode);

        if (invite) {
            const currentDate = new Date();

            // if date difference is greather than 2 hours
            if (currentDate.getTime() - invite.createdAt.getTime() > 2 * 60 * 60 * 1000) {
                return res.status(400).json({ message: "Invitation has expired." });
            }
        }
    }

    const passwordHash = await bcrypt.hash(password, 10);

    try {
        const user = await User.create({
            username: username,
            email: email,
            role: invite ? "organizer" : "user",
            password: passwordHash
        });

        // if invitation exists, mark as 'used'
        if (invite) {
            invite.used = true;
            await invite.save();
        }

        // populate session
        session.username = user.username;
        session.role = user.role;

        // exclude fields
        const { password, verified, authMessage, ...fields } = user._doc;

        res.status(201).json(fields);

        // @TODO: Send verification email
    } catch (err) {
        // duplicated key
        if (err.code === 11000) {
            const keyName = utils.capitalizeFirstLetter(Object.keys(err.keyPattern)[0]);

            res.status(400).json({ message: `${keyName} already exists.` });
        } else {
            throw new Error(err);
        }
    }
};

exports.login = async (req, res) => {
    const session = req.session;

    if (session.username) {
        return res.status(400).json({ message: "Already logged in." });
    }

    const username = req.body.username;
    const plainPassword = req.body.password;

    if (username.length < 3) {
        return res.status(400).json({ message: "Username is not valid." });
    }

    if (!validator.isStrongPassword(plainPassword)) {
        return res.status(400).json({ message: "Password is not valid." });
    }

    const user = await User.findOne({ username: username });

    if (!user) {
        return res.status(400).json({ message: "Username or password is not valid." });
    }

    const isPasswordValid = await bcrypt.compare(plainPassword, user.password);

    if (!isPasswordValid) {
        return res.status(400).json({ message: "Username or password is not valid." });
    }

    // populate session
    session.username = user.username;
    session.role = user.role;

    // exclude fields
    const { password, verified, authMessage, ...fields } = user._doc;

    res.json(fields);
};

exports.resetPassword = async (req, res) => {
    const session = req.session;

    if (session.username) {
        return res.status(400).json({ message: "Already logged in." });
    }

    const resetPasswordRequestId = req.body.id;
    const password = req.body.password;

    const resetPasswordRequest = await ResetPasswordRequest.findById(resetPasswordRequestId);

    if (!resetPasswordRequest) {
        return res.status(400).json({ message: "Request not found." });
    }

    const currentDate = new Date();

    // if date difference is greather than 2 hours
    if (currentDate.getTime() - resetPasswordRequest.createdAt.getTime() > 2 * 60 * 60 * 1000) {
        return res.status(400).json({ message: "Request has expired." });
    }

    const user = await User.findOne({ email: resetPasswordRequest.email });

    if (!user) {
        return res.status(400).json({ message: "User not found." });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // save user
    user.password = passwordHash;
    user.save();

    // mark request as 'used'
    resetPasswordRequest.used = true;
    resetPasswordRequest.save();

    res.json({ message: "Password successfully changed." });
};

exports.logout = (req, res) => {
    const session = req.session;

    session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: "Server error." });
        }

        res.json({ message: "Logged out successfully." });
    });
};

exports.auth = async (req, res) => {
    const session = req.session;

    const user = await User.findOne({ username: session.username }).select("-password -verified -authMessage");

    if (!user) {
        return res.status(404).status({ message: "User not found." });
    }

    res.json(user);
};
