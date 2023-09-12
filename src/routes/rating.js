const express = require("express");
const ratingSchema = require("../models/rating");

const router = express.Router();

// Upsert rating
router.post("/rate", (req, res) => {
    const { userId, animeId } = req.body;
    
    const ratingData = {
        userId,
        animeId,
        watchStatus: req.body.watchStatus,
        episodesWatched: req.body.episodesWatched || 0,
        score: req.body.score || null,
        startingDate: req.body.startingDate || null,
        finishedDate: req.body.finishedDate || null,
    };

    ratingSchema.findOneAndUpdate(
        { userId, animeId },
        ratingData,
        { upsert: true, new: true }
    )
    .then((data) => res.json(data))
    .catch((error) => res.json({ message: error }));
});

//get all ratings
router.get("/ratings", (req, res) => {
    ratingSchema
    .find()
    .then((data) => res.json(data))
    .catch((error) => res.json({message: error}));
});

//get rating by id
router.get("/ratings/:id", (req, res) => {
    ratingSchema
    .findById(req.params.id)
    .then((data) => res.json(data))
    .catch((error) => res.json({message: error}));
});

module.exports = router;