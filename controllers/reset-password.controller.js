const validator = require("validator");

const User = require("../schemas/User");
const ResetPasswordRequest = require("../schemas/ResetPasswordRequest");

const constants = require("../constants");

exports.create = async (req, res) => {
    const email = req.body.email;

    if (!validator.isEmail(email)) {
        return res.status(400).json({ message: "Email is not valid." });
    }

    const user = await User.findOne({ email: email });

    if (!user) {
        return res.status(400).json({ message: "User not found." });
    }

    // check if request already exists
    const resetPasswordRequestExist = await ResetPasswordRequest.findOne({ email: email, used: false });

    if (resetPasswordRequestExist) {
        const currentDate = new Date();

        // if date difference is less than 2 hours
        if (currentDate.getTime() - resetPasswordRequestExist.createdAt.getTime() < constants.TWO_HOURS) {
            return res.status(400).json({ message: "Request already exists." });
        }
    }

    try {
        const resetPasswordRequest = await ResetPasswordRequest.create({ email });

        //  @TODO: Send reset password email
        const id = resetPasswordRequest.id;

        res.status(201).json({ message: "Successfully sent reset password link." });
    } catch (err) {
        throw new Error(err);
    }
};

exports.getById = async (req, res) => {
    const id = req.params.id;

    const resetPasswordRequest = await ResetPasswordRequest.findById(id);

    if (!resetPasswordRequest) {
        return res.status(404).json({ message: "Request not found." });
    }

    return res.json(resetPasswordRequest);
};
