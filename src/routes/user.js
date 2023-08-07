const express = require("express");
const userSchema = require("../models/user");

const router = express.Router();

//create user
router.post('/users', (req, res) => {
    const { username, email } = req.body;
  
    // Check if the user with the same email already exists
    userSchema.findOne({ email })
      .then(existingUser => {
        if (existingUser) {
          // User with the same email already exists
          return res.status(409).json({ message: 'User already exists with this email.' });
        } else {
          // Create a new user
          const user = new userSchema({ username, email });
          user.save()
            .then(data => res.json(data))
            .catch(error => res.status(500).json({ message: 'Failed to create user.', error }));
        }
      })
      .catch(error => res.status(500).json({ message: 'Error while checking user existence.', error }));
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