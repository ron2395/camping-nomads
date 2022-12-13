const mongoose = require('mongoose');
const Camp = require('../models/camp');
const { places, descriptors } = require('./seedHelpers');
const cities = require('./cities');

mongoose.connect('mongodb://localhost:27017/yelp-camp');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('connected to DB');
})

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Camp.deleteMany({});
    for (let i = 0; i < 150; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = random1000 + 500;
        const camp = new Camp(
            {
                author : "6367c6e315a02171dd877b19",
                location : `${cities[random1000].city}, ${cities[random1000].state}`,
                title : `${sample(descriptors)} ${sample(places)}`,
                price,
                geometry: {
                    type: "Point",
                    coordinates : [
                        cities[random1000].longitude,
                        cities[random1000].latitude
                    ]
                },
                images : [ { 
                url : "https://res.cloudinary.com/dsyimxnrg/image/upload/v1666339596/HimalyanCamps/ugqlkvkqgumaez9kjjo9.jpg", 
                filename : "HimalyanCamps/ugqlkvkqgumaez9kjjo9"
            }, 
            {
                url : "https://res.cloudinary.com/dsyimxnrg/image/upload/v1666339597/HimalyanCamps/gjxi1bdty9fjipwv8lwt.jpg",
                filename : "HimalyanCamps/gjxi1bdty9fjipwv8lwt"
            } ],
                description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Adipisci recusandae officiis molestiae quasi laborum ea error necessitatibus non, fuga quibusdam fugit quo, facilis esse accusantium, repudiandae magnam. Repudiandae, reprehenderit commodi!'
            }
        );
        await camp.save();
    }
}

seedDB().then(() => {
    db.close();
})