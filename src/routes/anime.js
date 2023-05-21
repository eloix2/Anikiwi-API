const express = require("express");
const userSchema = require("../models/anime");

const router = express.Router();

//script to update the database
router.get("/update", (req, res) => {
    require("../../scripts/dbUpdater");
    res.send("Database updated");
});

module.exports = router;