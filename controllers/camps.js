const Camp = require('../models/camp');
const { cloudinary } = require('../cloudinary/index');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const review = require('../models/review');
const geocoder = mbxGeocoding({ accessToken: process.env.MAPBOX_TOKEN });

module.exports.index = async (req, res) => {
    const url = 'camps';
    const sort = { title: 1 };
    const limit = 12;
    const { page } = req.query;
    const skip = (page - 1) * limit;
    const totalCamps = await Camp.find({});
    const totalPages = Math.ceil((totalCamps.length)/limit);
    const camps = await Camp.find({}).sort(sort).skip(skip).limit(limit);
    res.render('camps/index', { camps, totalPages, page, totalCamps, url });
}

module.exports.renderNewForm = (req, res) => {
    res.render('camps/new');
}

module.exports.createNew = async (req, res, next) => {
    const camp = new Camp(req.body.camp);
    const { longitude, latitude } = req.body;
    camp.geometry = {
        coordinates : [longitude, latitude],
        type : "Point"
    }
    camp.author = req.user._id;
    camp.date = Date.now();
    camp.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    await camp.save();
    req.flash('success', 'New listing created!');
    res.redirect(`/camps/${camp._id}`);
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const camp = await Camp.findById(id);
    if (!camp) {
        req.flash('error', 'Camp not found!');
        return res.redirect('/camps');
    }
    res.render('camps/edit', { camp });
}

module.exports.renderShowPage = async (req, res) => {
    const { id } = req.params;
    const camp = await Camp.findById(id).populate({
        path: 'reviews',
        populate: { path: 'author' }
    }).populate('author');
    if (!camp) {
        req.flash('error', 'Camp not found');
        res.redirect('/camps');
    }
    console.log(camp)
    let alreadyReviewed = 0;
    if(req.user){
        const dbQuery = ({
            "author": req.user._id
        })
        const currentUserReview = await review.find(dbQuery);
        if(currentUserReview.length){
            alreadyReviewed = currentUserReview;
        }
    }
    let totalRating = 0;
    for(let review of camp.reviews){
        totalRating += review.rating;
    }
    const averageRating = totalRating/camp.reviews.length;
    res.render('camps/show', { camp, alreadyReviewed, averageRating });
}

module.exports.updateCamp = async (req, res) => {
    const { id } = req.params;
    const camp = await Camp.findByIdAndUpdate(id, { ...req.body.camp });
    const newImages = req.files.map(f => ({ url: f.path, filename: f.filename }));
    camp.images.push(...newImages);
    camp.updatedAt = new Date(0);
    await camp.save();
    if (req.body.deleteImages) {
        for (filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await camp.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
    }
    req.flash('success', 'Updated successfully!');
    res.redirect(`/camps/${camp._id}`);
}

module.exports.destroyCamp = async (req, res) => {
    const redirect = req.body.redirect;
    const camp = await Camp.findById(req.params.id, { ...req.body.camp });
    for(img of camp.images){
        await cloudinary.uploader.destroy(img.filename);
    }
    await Camp.findByIdAndDelete(req.params.id);
    req.flash('success', 'Camp has been deleted!');
    if(redirect) {
        res.redirect('back');
    } else {
        res.redirect('/camps');
    }
}