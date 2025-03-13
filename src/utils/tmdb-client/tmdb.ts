import axios from "axios";

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
}