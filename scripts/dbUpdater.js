//Gets a json from an url and updates the database in mongodb
//Importing modules
const mongoose = require('mongoose');
const Anime = require('../src/models/anime');

//Connecting to the database
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

//TODO: Change save for findOneAndUpdate

fetch('https://raw.githubusercontent.com/manami-project/anime-offline-database/master/anime-offline-database.json')
  .then(res => res.json())
  .then(json => {
    //json variable contains object with data
    json.data.forEach(async (anime) => {
        //Creating a new anime
        const newAnime = new Anime({
            sources: anime.sources,
            title: anime.title,
            type: anime.type,
            episodes: anime.episodes,
            status: anime.status,
            season: anime.animeSeason.season,
            year: anime.animeSeason.year,
            picture: anime.picture,
            thumbnail: anime.thumbnail,
            synonyms: anime.synonyms,
            relations: anime.relations,
            tags: anime.tags
        });
        //Saving the anime
        await newAnime.save();
    });
  })
    .catch(err => console.log(err)

);
