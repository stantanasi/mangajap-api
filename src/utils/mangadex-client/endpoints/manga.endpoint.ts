import { AxiosInstance } from 'axios';

type Response<T> = {
  result: string;
  response: string;
  data: T;
  limit: number;
  offset: number;
  total: number;
}

export type Manga = {
  id: string
  type: 'manga'
  attributes: {
    title: {
      [language: string]: string
    }
    altTitles: {
      [language: string]: string
    }[]
    description: {
      [language: string]: string
    }
    isLocked: boolean
    links: {
      [link: string]: string
    }
    originalLanguage: string
    lastVolume: string
    lastChapter: string
    publicationDemographic: 'shounen' | 'shoujo' | 'josei' | 'seinen'
    status: 'ongoing' | 'completed' | 'hiatus' | 'cancelled'
    year: number
    contentRating: 'safe' | 'suggestive' | 'erotica' | 'pornographic'
    tags: {
      id: string
      type: 'tag'
      attributes: {
        name: {
          [language: string]: string
        }
        description: [
        ]
        group: 'genre' | 'format' | 'theme' | 'content'
        version: number
      }
      relationships: {
        id: string
        type: string
      }[]
    }[]
    state: 'published'
    chapterNumbersResetOnNewVolume: boolean
    createdAt: string
    updatedAt: string
    version: number
    availableTranslatedLanguages: string[]
  }
  relationships: {
    id: string
    type: string
    related?: 'monochrome' | 'colored' | 'preserialization' | 'serialization' | 'prequel' | 'sequel' | 'main_story' | 'side_story' | 'adapted_from' | 'spin_off' | 'based_on' | 'doujinshi' | 'same_franchise' | 'shared_universe' | 'alternate_story' | 'alternate_version'
  }[]
}

export interface MangaVolumes {
  result: 'ok' | 'error';
  volumes: {
    [volume: string]: {
      volume: string;
      count: number;
      chapters: {
        [chapters: string]: {
          chapter: string;
          id: string;
          others: string[];
          count: number;
        };
      };
    };
  }
}

export default class MangaEndpoint {

  private client: AxiosInstance

  constructor(client: AxiosInstance) {
    this.client = client
  }


  async list(
  ): Promise<Response<Manga[]>> {
    const response = await this.client.get<Response<Manga[]>>(`/manga`)

    return response.data
  }

  async get(
    id: string,
  ): Promise<Response<Manga>> {
    const response = await this.client.get<Response<Manga>>(`/manga/${id}`)

    return response.data
  }

  async aggregate(
    id: string,
  ): Promise<MangaVolumes> {
    const response = await this.client.get<MangaVolumes>(`/manga/${id}/aggregate`)

    return response.data
  }
}