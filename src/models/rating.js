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
        enum: ['Watching', 'Completed', 'Planning', 'Dropped'],
        required: true,
    },
    episodesWatched: { 
        type: Number, 
        default: 0 
    },
    score: {
        type: Number,
        default: null
    },
    startingDate: {
        type: Date,
        default: null
    },
    finishedDate: {
        type: Date,
        default: null
    },

});

module.exports = mongoose.model('Rating', ratingSchema);