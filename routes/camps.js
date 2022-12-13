const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, validateCamp, isAuthor, fileSizeLimitErrorHandler } = require('../middleware');
const camps = require('../controllers/camps');
const multer = require('multer');
const { storage } = require('../cloudinary/index');
const maxSize = 1 * 1000 * 1000;
const upload = multer({ storage,
    limits: { fileSize: maxSize }
});

router.route('/')
    .get(catchAsync(camps.index))
    .post(isLoggedIn, upload.array('image'), fileSizeLimitErrorHandler, validateCamp, catchAsync(camps.createNew));

router.get('/new', isLoggedIn, camps.renderNewForm);

router.route('/:id')
    .get(catchAsync(camps.renderShowPage))
    .put(isLoggedIn, isAuthor, upload.array('image'), fileSizeLimitErrorHandler, validateCamp, catchAsync(camps.updateCamp))
    .delete(isLoggedIn, isAuthor, catchAsync(camps.destroyCamp));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(camps.renderEditForm));

module.exports = router;