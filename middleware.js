const Camp = require('./models/camp');
const ExpressError = require('./utils/ExpressError');
const { campSchema, reviewSchema } = require('./schemas');
const Review = require('./models/review');

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be signed in for this action.');
        return res.redirect('/login');
    }
    next();
}

module.exports.validateCamp = (req, res, next) => {
    const { error } = campSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(er => er.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const camp = await Camp.findById(id);
    if (!camp.author.equals(req.user._id) && req.user.role !== 'admin'){
        req.flash('error', 'Permission denied');
        return res.redirect(`/camps/${id}`)
    }
    next();
}

module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id) && req.user.role !== 'admin') {
        req.flash('error', 'Permission denied');
        return res.redirect(`/camps/${id}`)
    }
    next();
}

module.exports.fileSizeLimitErrorHandler = (err, req, res, next) => {
    if (err) {
        req.flash('error', 'Images should be under 1MB and filetype should be jpeg or png');
        return res.redirect('back');
    } else {
        next();
    }
}

module.exports.isAdmin = async (req, res, next) => {
    if(req.user.role === 'admin'){
        next();
    }
    else{
        req.flash('error', "You don't have permission to access this");
        return res.redirect('camps');
    }
}