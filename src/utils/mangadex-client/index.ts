import axios from "axios";

export default class MangaDex {

  private client = axios.create();

  constructor() {
    this.client = axios.create({
      baseURL: 'https://api.mangadex.org',
      headers: {
        Accept: 'application/json',
      },
    });
  }
}