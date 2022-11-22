module.exports = (req, res, next) => {
    const session = req.session;

    if (!session.username) {
        return res.status(401).json({ message: "Not logged in." });
    }

    next();
};
