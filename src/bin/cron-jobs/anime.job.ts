import axios from 'axios';
import dotenv from 'dotenv';
import { connect } from 'mongoose';
import Anime from '../../models/anime.model';
import Episode from '../../models/episode.model';
import Season from '../../models/season.model';
import TheMovieDB from '../../utils/providers/themoviedb';

(async () => {
  dotenv.config();

  console.log('-------- START --------');

  await connect(process.env.MONGO_DB_URI!);

  for (const anime of await Anime.find({ 'links.themoviedb': { $exists: true } }).populate('seasons').populate('episodes')) {
    const animeTMDB = await TheMovieDB.findAnimeById(anime.links.themoviedb);

    if (!animeTMDB) return;

    if (anime.inProduction !== animeTMDB.inProduction) {
      anime.inProduction = animeTMDB.inProduction;
      await anime.save();
      console.log(anime.title, '|', 'UPDATE');
    }

    for (const seasonTMDB of (animeTMDB.seasons ?? [])) {
      let season = anime.seasons?.find((season) => season.number == seasonTMDB.number);

      if (!season) {
        season = new Season({
          titles: seasonTMDB.titles,
          posterImage: seasonTMDB.posterImage ?
            await axios
              .get(seasonTMDB.posterImage, { responseType: 'arraybuffer' })
              .then(response => Buffer.from(response.data, 'binary').toString('base64')) :
            null,
          overview: seasonTMDB.overview,
          number: seasonTMDB.number,
          anime: anime._id,
        });
        await season.save();
        console.log(anime.title, '|', 'Season', season.number, '|', 'CREATE');

        anime.seasons?.push(season);
      } else {
      }

      for (const episodeTMDB of (seasonTMDB.episodes ?? [])) {
        let episode = anime.episodes?.find((episode) => episode.number === episodeTMDB.number);

        if (!episode) {
          episode = new Episode({
            titles: episodeTMDB.titles,
            overview: episodeTMDB.overview,
            relativeNumber: episodeTMDB.relativeNumber,
            number: episodeTMDB.number,
            airDate: episodeTMDB.airDate,
            duration: episodeTMDB.duration,
            anime: anime._id,
            season: season._id,
          });
          await episode.save();
          console.log(anime.title, '|', `S${season.number} E${episode.relativeNumber} (${episode.number})`, '|', 'CREATE');
        } else {
        }
      }
    }
  }

  console.log('-------- FINISHED --------');
  process.exit();
})().catch((e) => {
  console.error(e);
});
