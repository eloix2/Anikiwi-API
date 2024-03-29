const express = require("express");
const animeSchema = require("../models/anime");
const updater = require("../../scripts/dbUpdater");
const router = express.Router();

//script to update the database
router.get("/animes/update", async (req, res) => {
    res.send("Database update request received. Updating in the background.");
  
    // Start the update process in the background
    updater.updateDB();
  });
  

router.get("/animes/search/:id", (req, res) => {
    animeSchema
    .findById(req.params.id)
    .then((data) => res.json(data))
    .catch((error) => res.json({message: error}));
});

router.get("/animes/search", (req, res) => {
    //QUERY TREATMENT
    const queryObj = { ...req.query };
    const excludedFields = ["page", "limit"];
    excludedFields.forEach((el) => delete queryObj[el]);

    if (queryObj.title) {
        queryObj.title = { $regex: queryObj.title, $options: "i" };
    }

    //PAGINATION
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const skips = (page - 1) * limit;

    //QUERY EXECUTION
    animeSchema
    .find(queryObj).skip(skips).limit(limit)
    .then((data) => res.json(data))
    .catch((error) => res.json({message: error}));
});



module.exports = router;