import { AxiosInstance } from "axios";

export default class TvSeries {

  private client: AxiosInstance;

  constructor(client: AxiosInstance) {
    this.client = client;
  }
}
