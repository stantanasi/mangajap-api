import { Schema, model, Types, Document } from 'mongoose';
import { ref } from 'firebase/storage';
import slugify from "slugify";
import { storage, uploadFile } from '../firebase-app';
import MongooseJsonApi, { JsonApiModel } from '../utils/mongoose-jsonapi/mongoose-jsonapi';
import AnimeEntry, { IAnimeEntry } from "./anime-entry.model";
import Episode, { IEpisode } from "./episode.model";
import { IFranchise } from "./franchise.model";
import { IGenre } from "./genre.model";
import Review, { IReview } from "./review.model";
import Season, { ISeason } from "./season.model";
import { IStaff } from "./staff.model";
import { ITheme } from "./theme.model";

export interface IAnime {
  _id: Types.ObjectId;

  title: string;
  titles: {
    [language: string]: string
  };
  slug: string;
  synopsis: string;
  startDate: Date;
  endDate: Date | null;
  origin: string;
  animeType: 'tv' | 'ova' | 'ona' | 'movie' | 'music' | 'special';
  status: 'airing' | 'finished' | 'unreleased' | 'upcoming';
  youtubeVideoId: string;
  coverImage: string | null;
  bannerImage: string | null;

  seasonCount: number;
  episodeCount: number;
  episodeLength: number;

  averageRating: number | null;
  ratingRank: number | null;
  popularity: number;
  userCount: number;
  favoritesCount: number;
  reviewCount: number;

  genres: Types.ObjectId[] & IGenre[];
  themes: Types.ObjectId[] & ITheme[];
  seasons?: ISeason[];
  episodes?: IEpisode[];
  staff?: IStaff[];
  reviews?: IReview[];
  franchises?: IFranchise[];
  'anime-entry'?: IAnimeEntry | null;

  createdAt: Date;
  updatedAt: Date;
}

export interface IAnimeModel extends JsonApiModel<IAnime> {
}

export const AnimeSchema = new Schema<IAnime, IAnimeModel>({
  title: {
    type: String,
    required: true,
  },

  titles: {
    type: Schema.Types.Mixed,
    default: {},
  },

  slug: {
    type: String,
    required: true,
    lowercase: true,
  },

  synopsis: {
    type: String,
    default: '',
  },

  startDate: {
    type: Date,
    required: true,
    transform: function (this, val) {
      return val.toISOString().slice(0, 10);
    }
  },

  endDate: {
    type: Date,
    default: null,
    transform: function (this, val) {
      return val?.toISOString().slice(0, 10) ?? null;
    },
  },

  origin: {
    type: String,
    default: '',
  },

  animeType: {
    type: String,
    required: true,
    enum: ['tv', 'ova', 'ona', 'movie', 'music', 'special'],
  },

  status: {
    type: String,
    required: true,
    enum: ['airing', 'finished', 'unreleased', 'upcoming'],
  },

  youtubeVideoId: {
    type: String,
    default: '',
  },

  coverImage: {
    type: String,
    default: null,
  },

  bannerImage: {
    type: String,
    default: null,
  },


  seasonCount: {
    type: Number,
    default: 0,
  },

  episodeCount: {
    type: Number,
    default: 0,
  },

  episodeLength: {
    type: Number,
    default: 0,
  },


  averageRating: {
    type: Number,
    default: null,
  },

  ratingRank: {
    type: Number,
    default: null,
  },

  popularity: {
    type: Number,
    default: 0,
  },

  userCount: {
    type: Number,
    default: 0,
  },

  favoritesCount: {
    type: Number,
    default: 0,
  },

  reviewCount: {
    type: Number,
    default: 0,
  },


  genres: [{
    type: Schema.Types.ObjectId,
    ref: 'Genre',
    default: [],
  }],

  themes: [{
    type: Schema.Types.ObjectId,
    ref: 'Theme',
    default: [],
  }],
}, {
  id: false,
  versionKey: false,
  timestamps: true,
  minimize: false,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

AnimeSchema.virtual('seasons', {
  ref: 'Season',
  localField: '_id',
  foreignField: 'anime',
  options: {
    sort: { number: 1 },
  },
});

AnimeSchema.virtual('episodes', {
  ref: 'Episode',
  localField: '_id',
  foreignField: 'anime',
  options: {
    sort: { number: 1 },
  },
});

AnimeSchema.virtual('staff', {
  ref: 'Staff',
  localField: '_id',
  foreignField: 'anime'
});

AnimeSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'anime',
  options: {
    sort: { updatedAt: -1 },
  },
});

AnimeSchema.virtual('franchises', {
  ref: 'Franchise',
  localField: '_id',
  foreignField: 'source'
});

AnimeSchema.virtual('anime-entry');


AnimeSchema.pre<IAnime & Document>('validate', async function () {
  if (this.isModified('title')) {
    this.slug = slugify(this.title);
  }
});

AnimeSchema.pre<IAnime & Document>('save', async function () {
  if (this.isModified('coverImage')) {
    this.coverImage = await uploadFile(
      ref(storage, `anime/${this._id}/images/cover.jpg`),
      this.coverImage,
    );
  }

  if (this.isModified('bannerImage')) {
    this.bannerImage = await uploadFile(
      ref(storage, `anime/${this._id}/images/banner.jpg`),
      this.bannerImage,
    );
  }
});

AnimeSchema.pre('findOne', async function () {
  const _id = this.getFilter()._id;
  if (!_id) return;

  await Anime.findOneAndUpdate(this.getFilter(), {
    seasonCount: await Season.count({
      anime: _id,
    }),

    episodeCount: await Episode.count({
      anime: _id,
    }),

    averageRating: (await AnimeEntry.aggregate()
      .match({ anime: new Types.ObjectId(_id) })
      .group({
        _id: null,
        averageRating: { $avg: '$rating' },
      }))[0]
      ?.averageRating ?? null,

    userCount: await AnimeEntry.count({
      anime: _id,
      isAdd: true,
    }),

    favoritesCount: await AnimeEntry.count({
      anime: _id,
      isFavorites: true,
    }),

    reviewCount: await Review.count({
      anime: _id,
    }),

    popularity: (await Anime.aggregate()
      .match({ _id: new Types.ObjectId(_id) })
      .lookup({
        from: 'animeentries',
        localField: '_id',
        foreignField: 'anime',
        as: 'entriesCount',
        pipeline: [
          {
            $match: {
              updatedAt: {
                $gte: new Date(new Date().setDate(new Date().getDate() - 7)),
              },
            },
          },
        ],
      })
      .addFields({ entriesCount: { $size: '$entriesCount' } })
      .addFields({
        popularity: {
          $add: [
            '$userCount', '$favoritesCount',
            { $multiply: ['$userCount', { $ifNull: ['$averageRating', 0] }] },
            { $multiply: [2, '$entriesCount', { $ifNull: ['$averageRating', 0] }, { $add: ['$userCount', '$favoritesCount'] }] }
          ],
        },
      }))[0]
      ?.popularity | 0 ?? 0,
  });
});


AnimeSchema.plugin(MongooseJsonApi, {
  type: 'anime',
  filter: {
    query: (query: string) => {
      return {
        $or: [
          {
            title: {
              $regex: query,
              $options: 'i',
            },
          },
          {
            'titles.fr': {
              $regex: query,
              $options: 'i',
            },
          },
          {
            'titles.en': {
              $regex: query,
              $options: 'i',
            },
          },
          {
            'titles.en_jp': {
              $regex: query,
              $options: 'i',
            },
          },
          {
            'titles.ja_jp': {
              $regex: query,
              $options: 'i',
            },
          },
        ]
      };
    }
  },
});


const Anime = model<IAnime, IAnimeModel>('Anime', AnimeSchema);
export default Anime;

// TODO: cronjobs
// $animes = Anime::getInstance()->getWriteConnection()->query("
//     SELECT
//         *
//     FROM
//         anime;");
// foreach ($animes as &$anime) {
//     $rating = $anime['anime_rating'];
//     $userCount = $anime['anime_usercount'];
//     $favoritesCount = $anime['anime_favoritescount'];
//     $anime['anime_weightedrank'] = ($userCount + $favoritesCount) + $rating * $userCount + 2 * $rating * $favoritesCount;
// }
// array_multisort(array_column($animes, 'anime_weightedrank'), SORT_DESC, $animes);
// for($i=0; $i<count($animes); $i++) {
//     $animeId = $animes[$i]["anime_id"];
//     $animeRank = $i + 1;

//     Anime::getInstance()->getWriteConnection()->execute("
//         UPDATE
//             anime
//         SET
//             anime_ratingrank = :animeRank
//         WHERE
//           anime_id = :animeId;",
//         [
//             'animeId' => $animeId,
//             'animeRank' => $animeRank
//         ]);
// }
