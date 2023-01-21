exports.upload = async (req, res) => {
    const url = `${req.protocol}://${req.get("host")}`;

    const filePath = `${url}/uploads/${req.file.filename}`;

    res.json({ url: filePath });
};
