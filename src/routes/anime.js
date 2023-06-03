const express = require("express");
const animeSchema = require("../models/anime");
const updater = require("../../scripts/dbUpdater");
const router = express.Router();

//script to update the database
router.get("/animes/update", (req, res) => {
    updater.updateDB();
    res.send("Database updated");
});

router.get("/animes/all", (req, res) => {
    animeSchema
    .find()
    .then((data) => res.json(data))
    .catch((error) => res.json({message: error}));
});

router.get("/animes/:id", (req, res) => {
    animeSchema
    .findById(req.params.id)
    .then((data) => res.json(data))
    .catch((error) => res.json({message: error}));
});

router.get("/animes/search/:title", (req, res) => {
    animeSchema
    .find({title: {$regex: req.params.title, $options: 'i'}})
    .then((data) => res.json(data))
    .catch((error) => res.json({message: error}));
});

router.get("/animes/search/:title/:type", (req, res) => {
    animeSchema
    .find({title: {$regex: req.params.title, $options: 'i'}, type: req.params.type})
    .then((data) => res.json(data))
    .catch((error) => res.json({message: error}));
});


module.exports = router;