const Event = require("../schemas/Event");

exports.search = async (req, res) => {
    const query = req.query.q;

    await Event.createIndexes({ name: "text" });

    const events = await Event.find({ $text: { $search: query } }, { name: 1, image: 1, startDate: 1, location: 1 }).exec();

    res.json(events);
};
