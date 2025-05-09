import { AxiosInstance } from 'axios';
import { TvSeasonsDetails } from '../types/tv-seasons.type';

export default class TvSeasons {

  private client: AxiosInstance;

  constructor(client: AxiosInstance) {
    this.client = client;
  }

  async details(
    seriesId: number,
    seasonNumber: number,
  ): Promise<TvSeasonsDetails> {
    const response = await this.client.get<TvSeasonsDetails>(`/tv/${seriesId}/season/${seasonNumber}`);

    return response.data;
  }
}
