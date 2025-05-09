import Anime from '../models/anime.model';
import Episode from '../models/episode.model';
import Season from '../models/season.model';
import TMDb from '../utils/tmdb-client/tmdb';

abstract class TMDbService {

  static async sync() {
    const tmdb = new TMDb(process.env.TMDB_API_KEY!, {
      language: 'fr-FR',
    });

    const cursor = Anime.find({ 'links.themoviedb': { $exists: true } })
      .populate({
        path: 'seasons',
        populate: {
          path: 'episodes',
        },
      })
      .cursor();


    // ANIMES
    for await (const anime of cursor) {
      const series_tmdb = await tmdb.tvSeries.details(Number(anime.links.get('themoviedb')!))
        .then(async (series) => ({
          ...series,
          seasons: await Promise.all(
            series.seasons.map((season) => tmdb.tvSeasons.details(series.id, season.season_number))
          ),
        }))
        .catch(() => null);
      if (!series_tmdb) {
        console.error(`Can't find series with ID: ${anime.links.get('themoviedb')} - ${anime.title.get('fr-FR')}`);
        continue;
      }


      // ANIME
      if (!anime.get('title.fr-FR')) anime.set('title.fr-FR', series_tmdb.name);
      if (!anime.get('overview.fr-FR')) anime.set('overview.fr-FR', series_tmdb.overview);
      if (!anime.get('startDate.fr-FR')) anime.set('startDate.fr-FR', series_tmdb.first_air_date)
      if (anime.inProduction !== series_tmdb.in_production) anime.set('inProduction', series_tmdb.in_production);

      if (anime.isModified()) {
        const directModifiedPaths = anime.directModifiedPaths();
        await anime.save();
        console.log(anime.title.get('fr-FR'), '|', 'UPDATE', directModifiedPaths);
      }


      // SEASONS
      for (const season_tmdb of series_tmdb.seasons) {
        let season = anime.seasons!.find((season) => season.number == season_tmdb.season_number);

        if (!season) {
          season = new Season({
            number: season_tmdb.season_number,
            title: {
              'fr-FR': season_tmdb.name,
            },
            overview: {
              'fr-FR': season_tmdb.overview,
            },
            airDate: {
              'fr-FR': season_tmdb.air_date,
            },

            anime: anime._id,
          });
          season.episodes = [];

          await season.save();
          anime.seasons!.push(season);
          console.log(anime.title.get('fr-FR'), '|', `S${season.number}`, '|', 'CREATE');
        } else {
          if (!season.get('title.fr-FR')) season.set('title.fr-FR', season_tmdb.name);
          if (!season.get('overview.fr-FR')) season.set('overview.fr-FR', season_tmdb.overview);
          if (!season.get('airDate.fr-FR')) season.set('airDate.fr-FR', season_tmdb.air_date);

          if (season.isModified()) {
            const directModifiedPaths = season.directModifiedPaths();
            await season.save();
            console.log(anime.title.get('fr-FR'), '|', `S${season.number}`, '|', 'UPDATE', '|', directModifiedPaths);
          }
        }


        // EPISODES
        for (const episode_tmdb of season_tmdb.episodes) {
          let episode = season.episodes?.find((episode) => episode.number === episode_tmdb.episode_number)
            || season.episodes?.[episode_tmdb.episode_number - 1];

          if (!episode) {
            episode = new Episode({
              number: episode_tmdb.episode_number,
              title: {
                'fr-FR': episode_tmdb.name,
              },
              overview: {
                'fr-FR': episode_tmdb.overview,
              },
              airDate: {
                'fr-FR': episode_tmdb.air_date,
              },
              runtime: episode_tmdb.runtime,

              anime: anime._id,
              season: season._id,
            });

            await episode.save();
            season.episodes!.push(episode);
            console.log(anime.title.get('fr-FR'), '|', `S${season.number} E${episode.number}`, '|', 'CREATE');
          } else {
            if (episode.number != episode_tmdb.episode_number) episode.set('number', episode_tmdb.episode_number);
            if (!episode.get('title.fr-FR')) episode.set('title.fr-FR', episode_tmdb.name);
            if (!episode.get('overview.fr-FR')) episode.set('overview.fr-FR', episode_tmdb.overview);
            if (!episode.get('airDate.fr-FR')) episode.set('airDate.fr-FR', episode_tmdb.air_date);
            if (!episode.get('runtime')) episode.set('runtime', episode_tmdb.runtime);

            if (episode.isModified()) {
              const directModifiedPaths = episode.directModifiedPaths();
              await episode.save();
              console.log(anime.title.get('fr-FR'), '|', `S${season.number} E${episode.number}`, '|', 'UPDATE', '|', directModifiedPaths);
            }
          }
        }
      }
    }
  }
}


export default abstract class AnimeService {

  static async sync() {
    await TMDbService.sync();
  }
}
