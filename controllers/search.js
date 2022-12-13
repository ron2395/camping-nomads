const Camp = require('../models/camp');

module.exports.searchCamp = async (req, res) => {
    const query = req.body.query;
    const url = 'search';
    const sort = { title: 1 };
    const limit = 12;
    const dbQuery = ({
            "title": { $regex : new RegExp(query, "i") }
        })
    const camps = await Camp.find(dbQuery).sort(sort).limit(limit);
    const totalCamps = camps;
    const totalPages = 1;
    res.render('camps/index', { camps, totalPages, url, totalCamps, query });
}