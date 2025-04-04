import Anime from "../models/anime.model";
import TMDb from "../utils/tmdb-client/tmdb";

abstract class TMDbService {

  static async sync() {
    const tmdb = new TMDb(process.env.TMDB_API_KEY!, {
      language: 'fr-FR',
    });

    const animes = await Anime.find({ 'links.themoviedb': { $exists: true } });


    // ANIMES
    for (const anime of animes) {
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
        console.log(anime.title.get('fr-FR'), "|", "UPDATE", directModifiedPaths);
      }
    }
  }
}


export default abstract class AnimeService {

  static async sync() {
    await TMDbService.sync();
  }
}
