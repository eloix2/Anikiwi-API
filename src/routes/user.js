const express = require("express");
const userSchema = require("../models/user");
const ratingSchema = require("../models/rating");
const animeSchema = require("../models/anime");
const mongoose = require('mongoose');

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

//get user by id without returning email
router.get("/users/:id", (req, res) => {
  userSchema
      .findById(req.params.id)
      .select('-email')  // Excluir el campo 'email'
      .then((data) => res.json(data))
      .catch((error) => res.json({ message: error }));
});

// Get anime recommendations for a user by ID
async function getAnimeRecommendations(userId) {
  try {
    // Step 1: Get User Ratings
    const userRatings = await ratingSchema
    .find({ userId: userId, watchStatus: "Completed" })
    .sort({ score: -1 }); // Sorting by score in descending order

    // Step 2: Check if userRatings are empty or have less than 3 animes
    if (userRatings.length === 0) {
      // Return 3 random animes
      const randomAnimes = await animeSchema.aggregate([{ $sample: { size: 3 } }]);
      return { recommendations: randomAnimes, isRandom: true };
    }

    // Step 3: Check if userRatings have less than 3 animes
    if (userRatings.length < 3) {
      // Take one rating of userRatings, and duplicate it in the list, until userRatings.length is 3
      while (userRatings.length < 3) {
        userRatings.push(userRatings[0]);
      }
    }

    // Step 4: Get the top 30% of userRatings and random shuffle until we get 3
    const top30Percent = Math.ceil(0.3 * userRatings.length);
    const top30PercentRatings = userRatings.slice(0, top30Percent);

    // Random shuffle the top 30%
    const shuffledTop30Percent = top30PercentRatings.sort(() => Math.random() - 0.5);

    // Check if we have less than 3 animes after shuffling
    if (shuffledTop30Percent.length < 3) {
      // Add the next better userRatings after the 30% until we have 3
      const remainingRatings = userRatings.slice(top30Percent);
      const neededRatings = 3 - shuffledTop30Percent.length;
      const additionalRatings = remainingRatings.slice(0, neededRatings);
      shuffledTop30Percent.push(...additionalRatings);
    }

    // Extract animeIds from shuffledTop30Percent ratings
    const shuffledAnimeIds = shuffledTop30Percent.map(rating => rating.animeId);

    // Step 5: Find similar animes for each shuffled anime
    const similarAnimes = [];

    for (const animeId of shuffledAnimeIds) {
      // Find the anime associated with the current animeId
      const shuffledAnime = await animeSchema.findById(animeId);

      // console log
      console.log(shuffledAnime);

      // Extract tags from the shuffled anime
      const shuffledAnimeTags = shuffledAnime.tags;

      // Find an anime with the most overlapping tags
      const similarAnime = await animeSchema.aggregate([
        {
          $match: {
            tags: { $in: shuffledAnimeTags }, // Animes with at least one tag in common with the shuffled anime
            _id: { $nin: [...shuffledAnimeIds, ...similarAnimes.map(anime => anime._id)] }, // Exclude animes the user has already watched
          },
        },
        {
          $addFields: {
            commonTagsCount: {
              $size: {
                $setIntersection: ["$tags", shuffledAnimeTags], // Count the common tags
              },
            },
          },
        },
        {
          $sort: {
            commonTagsCount: -1, // Sort by the number of common tags in descending order
          },
        },
        {
          $limit: 10, // Take the 10 first animes with the most common tags
        },
      ]);

      // Add the similar anime to the list
      if (similarAnime.length > 0) {
        // Add a random anime from the similar animes
        const randomIndex = Math.floor(Math.random() * similarAnime.length);
        similarAnimes.push(similarAnime[randomIndex]);
      }
    }

    // Now similarAnimes contains 3 animes that are similar to the shuffled animes
    return { recommendations: similarAnimes , isRandom: false};

  } catch (error) {
    return { error: error.message };
  }
}



// Get anime recommendations for a user by ID
router.get("/users/:id/recommendations", async (req, res) => {
  try {
    const userId = req.params.id;
    const recommendations = await getAnimeRecommendations(userId);

    res.json(recommendations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
  
// Get statistics for a user by ID
router.get("/users/:id/stats", async (req, res) => {
  try {
    const userId = req.params.id;
    const userRatings = await ratingSchema.find({ userId: userId });
    const completedAnimes = userRatings.filter(rating => rating.watchStatus === "Completed");
    const userStats = {
      totalAnimesCompleted: completedAnimes.length,
      totalEpisodesSeen: userRatings.reduce((acc, cur) => acc + cur.episodesWatched, 0),
      meanScoreCompleted: completedAnimes.reduce((acc, cur) => acc + cur.score, 0) / completedAnimes.length,
      
      // animes completed per score: Count the number of animes completed with each score, from 0 to 10
      // include this format {"score": 0, "count": 2},
      animesCompletedPerScore: completedAnimes.reduce((acc, cur) => {
        if (cur.score === null) {
          return acc;
        }

        acc[cur.score].count += 1;
        return acc;
      }, Array(11).fill(0).map((_, i) => ({ score: i, count: 0 }))),
      
      
      // episodes seen per score: Count the number of episodes seen for each score, from 0 to 10
      // include this format {"score": 0, "count": 2},
      episodesSeenPerScore: userRatings.reduce((acc, cur) => {
        if (cur.score === null) {
          return acc;
        }

        acc[cur.score].count += cur.episodesWatched;
        return acc;
      }, Array(11).fill(0).map((_, i) => ({ score: i, count: 0 }))),

    };

    res.json(userStats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});    

module.exports = router;