const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const auth = require('../controllers/users');
const { isLoggedIn } = require('../middleware');

router.route('/register')
    .get(auth.renderRegistration)
    .post(catchAsync(auth.registerNew));

router.route('/login')
    .get(auth.renderLoginForm)
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), auth.login);

router.get('/resume', auth.resume);

router.get('/logout', auth.logout);

router.route('/profile')
    .get(isLoggedIn, auth.userProfile)
    .post(isLoggedIn, auth.mailChange);

router.route('/forgotPassword')
    .get(auth.renderForgotPassword)
    .post(auth.forgotPassword);

router.route('/passwordReset')
    .get(auth.renderPasswordReset)
    .post(auth.passwordReset);

module.exports = router;