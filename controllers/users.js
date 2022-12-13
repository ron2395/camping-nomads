const User = require('../models/user');
const Token = require('../models/passwordResetToken');
const JWT = require('jsonwebtoken');
const Secret = process.env.SECRET;
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const clientURL = process.env.CLIENT_URL;
const sendEmail = require('../utils/Email/sendEmail');
const bcryptSalt = process.env.BCRYPT_SALT;
const Camp = require('../models/camp');

module.exports.renderRegistration = (req, res) => {
    res.render('users/register');
}

module.exports.registerNew = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        const user = new User({ email, username });
        user.role = "user";
        const token = JWT.sign({ id: user._id }, Secret);
        user.token = token;
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', `Hey ${username}, Welcome to Himalyan camps!`);
            res.redirect('/camps');
        })
    } catch (e) {
        if(e.code === 11000){
            e.message = 'Sorry, Email already exits';
        }
        req.flash('error', e.message);
        res.redirect('register');
    }
}

module.exports.renderLoginForm = (req, res) => {
    res.render('users/login');
}

module.exports.login = (req, res) => {
    const { username } = req.body;
    req.flash('success', `Welcome back ${username}, Great to have you back!`);
    const redirectUrl = res.locals.returnTo || '/camps';
    delete res.locals.returnTo;
    res.redirect(redirectUrl);
}

module.exports.logout = (req, res) => {
    req.logout(req.user, err => {
        if (err) return next(err);
        req.flash('success', 'Successfully logged out!')
        res.redirect("/");
    });
}

module.exports.resume = (req, res) => {
    res.render('resume/resume');
}

module.exports.renderForgotPassword = (req, res) => {
    res.render('users/forgotPassword')
}

module.exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if(!user){
        req.flash('error', 'User does not exist');
        res.redirect('forgotPassword');
    } else{
        let token = await Token.findOne({ userId: user._id });
        if (token) { 
            await token.deleteOne();
            };
        let resetToken = crypto.randomBytes(32).toString("hex");
        const hash = await bcrypt.hash(resetToken, Number(bcryptSalt));
        await new Token({
            userId: user._id,
            token: hash,
            createdAt: Date.now(),
        }).save();
        const link = `${clientURL}/passwordReset?token=${resetToken}&id=${user._id}`;
        sendEmail(user.email,"Password Reset Link",{name: user.name, link: link},"../Email/requestResetPassword.handlebars");
        req.flash('success','A link to reset your password has been sent successfully');
        res.redirect('forgotPassword')
        }
}

module.exports.renderPasswordReset = async (req, res) => {
    const { id, token } = req.query;
    const user = await User.findById(id);
    let passwordResetToken = await Token.findOne({ id });
    if (!passwordResetToken) {
        req.flash('error', 'Invalid or expired password reset token');
        res.redirect('forgotPassword');
      }
    const isValid = await bcrypt.compare(token, passwordResetToken.token);
    if (!isValid) {
        req.flash('error', 'Invalid or expired password reset token');
        res.redirect('forgotPassword');
      }
    res.render('users/resetPassword', { user, id, token });
}

module.exports.passwordReset = async(req, res) => {
    const { password, email } = req.body;
    const user = await User.findOne({ email });
    const id = user._id;
    let passwordResetToken = await Token.findOne({ id });
    if (!passwordResetToken) {
        req.flash('error', 'Invalid or expired password reset token');
        res.redirect('forgotPassword');
      }
    console.log(password)
    user.setPassword(password, async (err, user) => {
        if(err){
            req.flash('error', err);
            req.redirect('forgotPassword');
        } else {
            sendEmail(
                user.email,
                "You just reset your password",
                {
                  name: user.username,
                },
                "../Email/resetPassword.handlebars"
              );
              await user.save();
              await passwordResetToken.deleteOne();
              req.flash('success', 'Your password has been successfully reset. Please login with new credentials');
              res.redirect('login');
        }
    })
}

module.exports.userProfile = async (req, res) => {
    const user = req.user;
    const campsByUser = await Camp.find({ author: user._id }).sort({ title: 1 });
    res.render('users/profile', { user, campsByUser } );
}

module.exports.mailChange = async (req, res) => {
    const { email, password } = req.body;
    const id = req.user._id;
    const mailCheck = await User.findOne({ email });
    if(mailCheck){
        req.flash('error', 'Email already in use');
        res.redirect('back')
    }else{
        const user = await User.findOne({ id });
        user.authenticate(password, async (err,model,passwordError) => {
            if(passwordError){
                req.flash('error', 'Incorrect password, try again');
                res.redirect('back')
            } else if(model) {
                user.email = email;
                await user.save();
                req.flash('success', 'Email has been successfully changed');
                res.redirect('profile');
            }
        })
    }
}