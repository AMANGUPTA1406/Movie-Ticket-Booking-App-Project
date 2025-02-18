const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', required: true 
    },
    showtimeId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Theater.screens.showtimes' 
    },
    Theater: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Theater' 
    },
    screenName:{
        type: String,
        required: true
    },
    seats: [Number],
    totalPrice: Number,
    status: { 
        type: String, enum: ['pending', 'confirmed', 'cancelled'], 
        default: 'pending' 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('Booking', bookingSchema);