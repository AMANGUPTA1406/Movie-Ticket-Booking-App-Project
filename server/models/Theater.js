const mongoose = require('mongoose');

const theaterSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    location: {    
        type: String, 
        required: true 
    },
    screens: [{
        name: String,
        seats:{
            type: Number,
            default: 100
        },
        showtimes: [{
            // showId: {
            //     type: mongoose.Schema.Types.ObjectId, // Unique identifier for each showtime
            //     default: mongoose.Types.ObjectId, // Automatically generate unique IDs
            //   },
            movie: { 
                type: mongoose.Schema.Types.ObjectId, 
                ref: 'Movie' 
            },
            time: Date,
            seatCategories: [{
                name: String,
                price: Number,
                seats: [Number]
            }],
            booked: [{ type: Number }] 
        }]
    }]
});

module.exports = mongoose.model('Theater', theaterSchema);