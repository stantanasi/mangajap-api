import { AxiosInstance } from "axios";

export default class TvSeasons {

  private client: AxiosInstance;

  constructor(client: AxiosInstance) {
    this.client = client;
  }
}
