const validator = require("validator");
const bcrypt = require("bcrypt");

const utils = require("../utils/format");

const User = require("../schemas/User");

exports.register = async (req, res) => {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;

    const session = req.session;

    if (username.length < 3) {
        return res.status(400).json({ success: false, message: "Username is not valid." });
    }

    if (!validator.isEmail(email)) {
        return res.status(400).json({ success: false, message: "Email is not valid." });
    }

    if (!validator.isStrongPassword(password)) {
        return res.status(400).json({ success: false, message: "Password is not valid." });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    try {
        const user = await User.create({ username: username, email: email, password: passwordHash });

        session.username = user.username;
        session.role = user.role;

        res.status(201).json({ success: true, message: "Registered successfully." });

        // @TODO: Send verification email
    } catch (err) {
        // duplicated key
        if (err.code === 11000) {
            const keyName = utils.capitalizeFirstLetter(Object.keys(err.keyPattern)[0]);

            res.status(400).json({ success: false, message: `${keyName} already exists.` });
        } else {
            throw new Error(err);
        }
    }
};

exports.login = (req, res) => {
    res.send("NOT IMPLEMENTED - Login");
};

exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return console.log(err);
        }
        res.json({ success: true, message: "Logged out successfully." });
    });
    res.send("NOT IMPLEMENTED - Logout");
};

exports.auth = async (req, res) => {
    console.log(req.session);

    const user = await User.findByUsername(req.session.username);

    console.log(user);

    res.send("NOT IMPLEMENTED - Auth");
};
