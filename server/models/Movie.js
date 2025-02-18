const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true 
    },
    genre: { 
        type: String,  
        required: true 
    },
    duration: { 
        type: Number, 
        required: true 
    }, // in minutes
    language: { 
        type: String, 
        required: true 
    },
    theaters: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Theater' 
    }]
});

module.exports = mongoose.model('Movie', movieSchema);