export interface MangaDexManga {
  result: 'ok' | 'error'
  response: 'entity'
  data: {
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
        al: string
        ap: string
        bw: string
        kt: string
        mu: string
        amz: string
        cdj: string
        ebj: string
        mal: string
        raw: string
        engtl: string
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
}

export interface MangaDexVolumes {
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

export interface MangaDexCovers {
  result: 'ok' | 'error',
  response: 'collection',
  data: {
    id: string
    type: 'cover_art',
    attributes: {
      description: string
      volume: string
      fileName: string
      locale: string
      createdAt: string
      updatedAt: string
      version: string
    },
    relationships: {
      id: string
      type: 'manga' | 'user'
    }[]
  }[],
  limit: number,
  offset: number,
  total: number
}
