const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true,
    },
    animeId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Anime',
        required: true,
    },
    watchStatus: {
        type: String, 
        enum: ['watching', 'completed', 'planning', 'dropped'],
        required: true,
    },
    episodes_watched: { 
        type: Number, 
        default: 0 
    },
    score: {
        type: Number,
        default: null
    },

});

module.exports = mongoose.model('Rating', ratingSchema);