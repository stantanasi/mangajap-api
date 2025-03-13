import axios from "axios";

export default class TMDb {

  private client = axios.create();

  constructor(apiKey: string) {
    this.client = axios.create({
      baseURL: 'https://api.themoviedb.org/3',
      headers: {
        Accept: 'application/json',
      },
      params: {
        api_key: apiKey,
      },
    });
  }
}