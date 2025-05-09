import { AxiosInstance } from 'axios';
import { TvSeriesDetails } from '../types/tv-series.type';

export default class TvSeries {

  private client: AxiosInstance;

  constructor(client: AxiosInstance) {
    this.client = client;
  }

  async details(
    seriesId: number,
  ): Promise<TvSeriesDetails> {
    const response = await this.client.get<TvSeriesDetails>(`/tv/${seriesId}`);

    return response.data;
  }
}
