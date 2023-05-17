const express = require("express");
const userSchema = require("../models/user");

const router = express.Router();

//create user
router.post("/users", (req, res) => {
    const user = userSchema(req.body);
    user
    .save()
    .then((data) => res.json(data))
    .catch((error) => res.json({message: error}));
});

//get all users
router.get("/users", (req, res) => {
    userSchema
    .find()
    .then((data) => res.json(data))
    .catch((error) => res.json({message: error}));
});

//get user by id
router.get("/users/:id", (req, res) => {
    userSchema
    .findById(req.params.id)
    .then((data) => res.json(data))
    .catch((error) => res.json({message: error}));
});

module.exports = router;