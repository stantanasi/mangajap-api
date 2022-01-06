import { Schema, model, Types, EnforceDocument } from 'mongoose';
import { ref } from 'firebase/storage';
import slugify from "slugify";
import { storage, uploadFile } from '../firebase-app';
import JsonApiSerializer from "../utils/mongoose-jsonapi/jsonapi-serializer";
import { AnimeEntryModel, IAnimeEntry } from "./anime-entry.model";
import { EpisodeModel, IEpisode } from "./episode.model";
import { IFranchise } from "./franchise.model";
import { IGenre } from "./genre.model";
import { IReview, ReviewModel } from "./review.model";
import { ISeason, SeasonModel } from "./season.model";
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

export const AnimeSchema = new Schema<IAnime>({
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


AnimeSchema.pre<EnforceDocument<IAnime, {}, {}>>('save', async function () {
  // TODO: _id sera nul lors du create
  if (this.isModified('title')) {
    this.slug = slugify(this.title);
  }

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
  const _id = this.getQuery()._id;
  if (!_id) return;

  await AnimeModel.findOneAndUpdate(this.getQuery(), {
    seasonCount: await SeasonModel.count({
      anime: _id,
    }),

    episodeCount: await EpisodeModel.count({
      anime: _id,
    }),

    averageRating: (await AnimeEntryModel.aggregate([
      { $match: { anime: _id } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' }
        }
      }
    ]))[0]?.averageRating,

    userCount: await AnimeEntryModel.count({
      anime: _id,
      isAdd: true,
    }),

    favoritesCount: await AnimeEntryModel.count({
      anime: _id,
      isFavorites: true,
    }),

    reviewCount: await ReviewModel.count({
      anime: _id,
    }),

    // TODO: popularity
    // result.popularity = (
    //         SELECT
    //         COALESCE(
    //             (anime_usercount + anime_favoritescount) +
    //             anime_usercount * COALESCE(anime_rating, 0) +
    //             2 * COUNT(animeentry_id) * COALESCE(anime_rating, 0) *(anime_usercount + anime_favoritescount),
    //             0
    //         )
    //     FROM
    //         animeentry
    //     WHERE
    //         animeentry_animeid = anime_id AND animeentry_updatedat BETWEEN(NOW() - INTERVAL 7 DAY) AND NOW()
    // )
  });
});


export const AnimeModel = model<IAnime>('Anime', AnimeSchema);


JsonApiSerializer.register('anime', AnimeModel, {
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
});


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
