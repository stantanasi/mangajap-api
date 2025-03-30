import { AxiosInstance } from "axios";

export default class MangaEndpoint {

  private client: AxiosInstance

  constructor(client: AxiosInstance) {
    this.client = client
  }
}