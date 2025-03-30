import axios from "axios";
import MangaEndpoint from "./endpoints/manga.endpoint";

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


  get manga(): MangaEndpoint {
    return new MangaEndpoint(this.client);
  };
}