const User = require('../models/user');
const Camp = require('../models/camp');
const Review = require('../models/review');
const { cloudinary } = require('../cloudinary/index');

module.exports.adminPanel = async (req, res) => {
    const camps = await Camp.find();
    const users = await User.find();
    res.render('users/adminpanel', {camps, users});
};

module.exports.destroyUserAdmin = async (req, res) => {
    const user = await User.findByIdAndDelete(req.params.id);
    const camps = await Camp.find({ author: user._id });
    for(let camp of camps){
        for(img of camp.images){
            await cloudinary.uploader.destroy(img.filename);
        }
    }
    await Camp.deleteMany({ author: user._id });
    await Review.deleteMany({ author: user._id });
    req.flash('success', 'User account and all related data has been deleted!');
    res.redirect('back');
};