import axios from "axios";
import Anime from "../../models/anime.model";
import Episode from "../../models/episode.model";
import Season from "../../models/season.model";

export default class TheMovieDB {

  public static async findAnimeById(id: string) {
    const anime = await axios.get<TheMovieDBTvShow>(`https://api.themoviedb.org/3/tv/${id}?api_key=${process.env.THE_MOVIE_DB_KEY}&append_to_response=seasons&language=fr-FR`)
      .then((res) => res.data)
      .then((anime) => new Anime({
        title: anime.original_name,
        inProduction: anime.in_production,

        seasons: anime.seasons
          .filter((season) => season.season_number !== 0 && season.episode_count > 0)
          .map((season) => new Season({
            titles: {
              fr: season.name !== `Saison ${season.season_number}` ? season.name : undefined,
            },
            posterImage: season.poster_path ? `https://image.tmdb.org/t/p/original${season.poster_path}` : null,
            overview: season.overview,
            number: season.season_number,
            episodeCount: season.episode_count,
          }))
      }))
      .catch(() => null);

    if (!anime) return null;

    for (const season of (anime.seasons ?? [])) {
      season.episodes = await axios.get<TheMovieDBSeason>(`https://api.themoviedb.org/3/tv/${id}/season/${season.number}?api_key=${process.env.THE_MOVIE_DB_KEY}&language=fr-FR`)
        .then((res) => res.data)
        .then((response) => {
          return response.episodes.map((episode) => {
            return new Episode({
              titles: {
                fr: episode.name,
              },
              overview: episode.overview,
              relativeNumber: episode.episode_number,
              number: anime.seasons
                ?.filter((season) => season.number !== 0)
                .reduce((acc, season) => {
                  if (season.number < episode.season_number) {
                    return acc + season.episodeCount;
                  } else if (season.number === episode.season_number) {
                    return acc + response.episodes.indexOf(episode) + 1;
                  } else {
                    return acc;
                  }
                }, 0),
              airDate: episode.air_date ? new Date(episode.air_date) : null,
              duration: episode.runtime,
            });
          });
        });
    }

    return anime;
  }
}

export interface TheMovieDBTvShow {
  adult: boolean;
  backdrop_path: string;
  created_by: [];
  episode_run_time: number[];
  first_air_date: string;
  genres: {
    id: number;
    name: string;
  }[];
  homepage: string;
  id: number;
  in_production: boolean;
  languages: string[];
  last_air_date: string;
  last_episode_to_air: {
    air_date: string;
    episode_number: number;
    id: number;
    name: string;
    overview: string;
    production_code: string;
    runtime: number;
    season_number: number;
    show_id: number;
    still_path: string;
    vote_average: number;
    vote_count: number
  };
  name: string;
  next_episode_to_air: {
    air_date: string;
    episode_number: number;
    id: number;
    name: string;
    overview: string;
    production_code: string;
    runtime: number;
    season_number: number;
    show_id: number;
    still_path: null;
    vote_average: number;
    vote_count: number
  };
  networks: {
    id: number;
    name: string;
    logo_path: string;
    origin_country: string
  }[];
  number_of_episodes: number;
  number_of_seasons: number;
  origin_country: string[];
  original_language: string;
  original_name: string;
  overview: string;
  popularity: number;
  poster_path: string;
  production_companies: {
    id: number;
    logo_path: string;
    name: string;
    origin_country: string
  }[];
  production_countries: {
    iso_3166_1: string;
    name: string
  }[];
  seasons: {
    air_date: null;
    episode_count: number;
    id: number;
    name: string;
    overview: string;
    poster_path: null;
    season_number: number
  }[];
  spoken_languages: {
    english_name: string;
    iso_639_1: string;
    name: string
  }[];
  status: string;
  tagline: string;
  type: string;
  vote_average: number;
  vote_count: number
}

export interface TheMovieDBSeason {
  _id: string,
  air_date: string,
  episodes: {
    air_date: string,
    episode_number: number,
    id: number,
    name: string,
    overview: string,
    production_code: string,
    runtime: number,
    season_number: number,
    show_id: number,
    still_path: string,
    vote_average: number,
    vote_count: number,
    crew: {
      job: string,
      department: string,
      credit_id: string,
      adult: boolean,
      gender: number,
      id: number,
      known_for_department: string,
      name: string,
      original_name: string,
      popularity: number,
      profile_path: string
    }[],
    guest_stars: {
      character: string,
      credit_id: string,
      order: number,
      adult: boolean,
      gender: number,
      id: number,
      known_for_department: string,
      name: string,
      original_name: string,
      popularity: number,
      profile_path: string
    }[]
  }[],
  name: string,
  overview: string,
  id: number,
  poster_path: string,
  season_number: number
}
