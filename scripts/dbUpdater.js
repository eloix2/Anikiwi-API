const mongoose = require('mongoose');
const Anime = require('../src/models/anime');

async function updateDB() {
  try {
    const response = await fetch('https://raw.githubusercontent.com/manami-project/anime-offline-database/master/anime-offline-database.json');
    const json = await response.json();

    const batchSize = 100;
    const totalRecords = json.data.length;

    console.log(`Updating ${totalRecords} records in batches of ${batchSize}...`);

    for (let i = 0; i < totalRecords; i += batchSize) {
      const batch = json.data.slice(i, i + batchSize);

      await Promise.all(batch.map(async (anime) => {
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
          upsert: true
        });
      }));

      console.log(`Processed ${Math.min(i + batchSize, totalRecords)} records out of ${totalRecords}`);
    }

    console.log('Database update complete.');

  } catch (error) {
    console.error('Error updating database:', error);
  }
}

module.exports.updateDB = updateDB;
