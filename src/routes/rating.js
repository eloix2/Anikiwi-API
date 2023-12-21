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
router.get("/rating/:id", (req, res) => {
    ratingSchema
    .findById(req.params.id)
    .then((data) => res.json(data))
    .catch((error) => res.json({message: error}));
});

//get rating by user id and anime id
router.get("/ratings/:userId/:animeId", (req, res) => {
    ratingSchema
    .findOne({ userId: req.params.userId, animeId: req.params.animeId })
    .then((data) => res.json(data))
    .catch((error) => res.json({message: error}));
});

//get ratings by user id
router.get("/ratings/user/:userId", (req, res) => {
    ratingSchema
    .find({ userId: req.params.userId })
    .then((data) => res.json(data))
    .catch((error) => res.json({message: error}));
});

//get ratings by anime id
router.get("/ratings/anime/:animeId", (req, res) => {
    ratingSchema
    .find({ animeId: req.params.animeId })
    .then((data) => res.json(data))
    .catch((error) => res.json({message: error}));
});

//get animes rated by user
router.get("/ratings/user/:userId/animes", (req, res) => {
    ratingSchema
    .find({ userId: req.params.userId })
    .populate("animeId")
    .then((data) => res.json(data))
    .catch((error) => res.json({message: error}));
});

router.get("/ratings/search", (req, res) => {
    // QUERY TREATMENT
    const queryObj = { ...req.query };
    const excludedFields = ["page", "limit", "minScore", "maxScore"];
    excludedFields.forEach((el) => delete queryObj[el]);

    if (queryObj.watchStatus) {
        queryObj.watchStatus = { $regex: queryObj.watchStatus, $options: "i" };
    }

    // Add filtering for minScore and maxScore
    if (req.query.minScore || req.query.maxScore) {
        queryObj.score = {};
        if (req.query.minScore) {
            queryObj.score.$gte = parseFloat(req.query.minScore);
        }
        if (req.query.maxScore) {
            queryObj.score.$lte = parseFloat(req.query.maxScore);
        }
    }

    // Extracting minDate and maxDate from query parameters
    const minDate = queryObj.minDate;
    const maxDate = queryObj.maxDate;
    delete queryObj.minDate;
    delete queryObj.maxDate;

    // Add $or condition for startingDate and finishedDate
    if (minDate && maxDate) {
        queryObj.$or = [
            { startingDate: { $gte: new Date(minDate), $lte: new Date(maxDate) } },
            { finishedDate: { $gte: new Date(minDate), $lte: new Date(maxDate) } }
        ];
    } else if (minDate) {
        queryObj.$or = [
            { startingDate: { $gte: new Date(minDate) } },
            { finishedDate: { $gte: new Date(minDate) } }
        ];
    } else if (maxDate) {
        queryObj.$or = [
            { startingDate: { $lte: new Date(maxDate) } },
            { finishedDate: { $lte: new Date(maxDate) } }
        ];
    }

    // PAGINATION
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const skips = (page - 1) * limit;

    // QUERY EXECUTION
    ratingSchema
        .find(queryObj).skip(skips).limit(limit)
        .populate('animeId')   // Populate anime information if needed
        .then((data) => res.json(data))
        .catch((error) => res.json({message: error}));
});

// Add 1 to episodes watched of a rating
router.put("/rating/:id/addEpisode", (req, res) => {
    ratingSchema
    .findByIdAndUpdate(req.params.id, {$inc: {episodesWatched: 1}})
    .populate("animeId")
    .then((data) => res.json(data))
    .catch((error) => res.json({message: error}));
});

module.exports = router;