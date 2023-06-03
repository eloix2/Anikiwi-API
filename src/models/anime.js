const { Int32 } = require('mongodb');
const mongoose = require('mongoose');

const animeSchema = new mongoose.Schema({
    sources: {
        type: [String],
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    episodes: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        required: true,
    },
    season: {
        type: String,
        required: true,
    },
    year: {
        type: Number,
        required: false,
    },
    picture: {
        type: String,
        required: true,
    },
    thumbnail: {
        type: String,
        required: true,
    },
    synonyms: {
        type: [String],
        required: true,
    },
    relations: {
        type: [String],
        required: true,
    },
    tags: {
        type: [String],
        required: true,
    },
});

module.exports = mongoose.model('Anime', animeSchema);