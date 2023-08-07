const express = require("express");
const ratingSchema = require("../models/rating");

const router = express.Router();

//create rating
router.post("/rate", (req, res) => {
    const rating = ratingSchema(req.body);
    rating
    .save()
    .then((data) => res.json(data))
    .catch((error) => res.json({message: error}));
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