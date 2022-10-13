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
