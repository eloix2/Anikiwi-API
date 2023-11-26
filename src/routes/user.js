const express = require("express");
const userSchema = require("../models/user");
const ratingSchema = require("../models/rating");
const animeSchema = require("../models/anime");

const router = express.Router();

//create user
router.post('/users', (req, res) => {
    const { username, email } = req.body;
  
    // Check if the user with the same email already exists
    userSchema.findOne({ email })
      .then(existingUser => {
        if (existingUser) {
          // User with the same email already exists
          // return user data
          return res.status(409).json(existingUser);
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



// Function to get anime recommendations for a user based on a subset of highest-rated animes' tags
async function getAnimeRecommendations(userId) {
  try {
    // Find the user's ratings
    const userRatings = await ratingSchema
      .find({ userId })
      .populate('animeId', 'title tags'); // Populate anime details with only title and tags

    if (userRatings.length === 0) {
      return { error: "User has no completed ratings" };
    }

    // Sort user's ratings by score in descending order
    const sortedUserRatings = userRatings.sort((a, b) => b.score - a.score);

    // Take a subset of highest-rated user ratings (e.g., top 20%)
    const subsetSize = Math.ceil(0.2 * sortedUserRatings.length);
    const subsetUserRatings = sortedUserRatings.slice(0, subsetSize);

    // Take a fraction of tags from the subset (e.g., top 30%)
    const tagFraction = 0.3;
    const uniqueTags = subsetUserRatings
      .flatMap(rating => rating.animeId.tags)
      .reduce((acc, tag) => {
        if (Math.random() < tagFraction) {
          acc.add(tag);
        }
        return acc;
      }, new Set());

    // Convert unique tags set to an array
    const uniqueTagsArray = Array.from(uniqueTags);

    // Find animes with similar tags
    const similarAnimes = await animeSchema
      .find({
        tags: { $in: uniqueTagsArray },
        _id: { $nin: sortedUserRatings.map((rating) => rating.animeId._id) }, // Exclude animes the user has already watched
      }).limit(100); // Limit the result to 100 animes

    // Shuffle the array of similar animes
    const shuffledAnimes = similarAnimes.sort(() => Math.random() - 0.5);

    // Limit the result to 3 recommendations
    const finalRecommendations = shuffledAnimes.slice(0, 3);

    return { recommendations: finalRecommendations };
  } catch (error) {
    return { error: error.message };
  }
}






// Get anime recommendations for a user by ID
router.get("/users/:id/recommendations", async (req, res) => {
  try {
    const userId = req.params.id;

    // For example, you can use the getAnimeRecommendations function from above
    const recommendations = await getAnimeRecommendations(userId);

    res.json(recommendations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
  
    

module.exports = router;