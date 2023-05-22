//Gets a json from an url and updates the database in mongodb
//Importing modules
const mongoose = require('mongoose');
const Anime = require('../src/models/anime');

function updateDB() {

  fetch('https://raw.githubusercontent.com/manami-project/anime-offline-database/master/anime-offline-database.json')
    .then(res => res.json())
    .then(json => {
      //json variable contains object with data
      json.data.forEach(async (anime) => {

        const filter = { title: anime.title, type: anime.type };
        const update = {
          sources: anime.sources,
          episodes: anime.episodes,
          status: anime.status,
          season: anime.animeSeason.season,
          year: anime.animeSeason.year,
          picture: anime.picture,
          thumbnail: anime.thumbnail,
          synonyms: anime.synonyms,
          relations: anime.relations,
          tags: anime.tags
        };

        await Anime.findOneAndUpdate(filter, update, {
          new: true,
          upsert: true // Make this update into an upsert
        });

      });
    })
    .then(() => { console.log('Updating Database...') })
    .catch(err => console.log(err)

    );
}

module.exports.updateDB = updateDB;