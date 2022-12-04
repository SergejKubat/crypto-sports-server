const validator = require("validator");
const bcrypt = require("bcrypt");
const Web3 = require("web3");

const User = require("../schemas/User");

const web3 = new Web3(new Web3.providers.HttpProvider(process.env.PROVIDER_HTTP_URL));

exports.update = async (req, res) => {
    const avatar = req.body.avatar;

    if (!validator.isURL(avatar)) {
        return res.status(400).json({ message: "User avatar is not valid." });
    }

    const user = await User.findOne({ username: req.session.username });

    user.avatar = avatar;

    await user.save();

    // exclude fields
    const { password, verified, authMessage, ...fields } = user._doc;

    res.json(fields);
};

exports.delete = async (req, res) => {
    const plainPassword = req.body.password;

    if (!validator.isStrongPassword(plainPassword)) {
        return res.status(400).json({ message: "Password is not valid." });
    }

    const session = req.session;

    const user = await User.findOne({ username: session.username });

    const isPasswordValid = await bcrypt.compare(plainPassword, user.password);

    if (!isPasswordValid) {
        return res.status(400).json({ message: "Incorrect password." });
    }

    session.destroy(async (err) => {
        if (err) {
            return res.status(500).json({ message: "Server error." });
        }

        await user.delete();

        res.json({ message: "User is successfully deleted." });
    });
};

exports.generateNonce = async (req, res) => {
    const session = req.session;

    const user = await User.findOne({ username: session.username });

    const nonce = Web3.utils.randomHex(32);

    const message = `Linking this wallet with CryptoSports account.\n\nNonce: ${nonce.slice(2)}`;

    user.authMessage = message;

    await user.save();

    res.json({ message: message });
};

exports.linkWallet = async (req, res) => {
    const session = req.session;

    const { walletAddress, signature } = req.body;

    if (!Web3.utils.isAddress(walletAddress)) {
        return res.status(400).json({ message: "Invalid wallet address." });
    }

    const user = await User.findOne({ username: session.username });

    const message = user.authMessage;

    const recoverAddress = web3.eth.accounts.recover(message, signature);

    if (walletAddress !== recoverAddress) {
        return res.status(400).json({ message: "Incorrect wallet address." });
    }

    user.walletAddress = walletAddress;

    await user.save();

    // exclude fields
    const { password, verified, authMessage, ...fields } = user._doc;

    res.json(fields);
};

exports.unlinkWallet = async (req, res) => {
    const session = req.session;

    const user = await User.findOne({ username: session.username });

    user.authMessage = "";
    user.walletAddress = "";

    await user.save();

    res.json({ message: "Wallet is successfully unlinked." });
};
