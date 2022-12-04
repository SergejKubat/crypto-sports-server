exports.upload = async (req, res) => {
    const url = `${req.protocol}://${req.get("host")}`;

    console.log(url);

    const filePath = `${url}/uploads/${req.file.filename}`;

    console.log(filePath);

    res.json({ url: filePath });
};
