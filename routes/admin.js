const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAdmin } = require('../middleware');
const admin = require('../controllers/admin');

router.get('/', isLoggedIn, isAdmin, admin.adminPanel);

router.delete('/:id', isLoggedIn, isAdmin, catchAsync(admin.destroyUserAdmin));

module.exports = router;