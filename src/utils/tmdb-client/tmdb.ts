import axios from "axios";
import TvSeries from "./endpoints/tv-series";

export default class TMDb {

  private client = axios.create();

  constructor(
    apiKey: string,
    options?: {
      language?: string;
    },
  ) {
    this.client = axios.create({
      baseURL: 'https://api.themoviedb.org/3',
      headers: {
        Accept: 'application/json',
      },
      params: {
        api_key: apiKey,
        language: options?.language ?? 'en-US',
      },
    });
  }

  get tvSeries(): TvSeries {
    return new TvSeries(this.client);
  };
}