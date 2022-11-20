const validator = require("validator");
const bcrypt = require("bcrypt");

const utils = require("../utils/format");

const User = require("../schemas/User");

exports.register = async (req, res) => {
    const session = req.session;

    if (session.username) {
        return res.status(400).json({ message: "Already logged in." });
    }

    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;

    if (username.length < 3) {
        return res.status(400).json({ message: "Username is not valid." });
    }

    if (!validator.isEmail(email)) {
        return res.status(400).json({ message: "Email is not valid." });
    }

    if (!validator.isStrongPassword(password)) {
        return res.status(400).json({ message: "Password is not valid." });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    try {
        const user = await User.create({ username: username, email: email, password: passwordHash });

        // populate session
        session.username = user.username;
        session.role = user.role;

        // exclude fields
        const { password, verified, ...fields } = user._doc;

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
    const { password, verified, ...fields } = user._doc;

    res.json(fields);
};

exports.logout = (req, res) => {
    const session = req.session;

    if (!session.username) {
        return res.status(401).json({ message: "Not logged in." });
    }

    session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: "Server error." });
        }

        res.json({ message: "Logged out successfully." });
    });
};

exports.auth = async (req, res) => {
    const session = req.session;

    if (!session.username) {
        return res.status(401).json({ message: "Not logged in." });
    }

    const user = await User.findOne({ username: session.username }).select("-password -verified");

    if (!user) {
        return res.status(404).status({ message: "User not found." });
    }

    res.json(user);
};
