const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const search = require('../controllers/search');

router.post('/', catchAsync(search.searchCamp));

module.exports = router;