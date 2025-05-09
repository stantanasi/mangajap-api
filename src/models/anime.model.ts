import MongooseJsonApi, { JsonApiInstanceMethods, JsonApiModel, JsonApiQueryHelper } from '@stantanasi/mongoose-jsonapi';
import { HydratedDocument, model, Model, Schema, Types } from 'mongoose';
import { deleteFile, uploadFile } from '../firebase-app';
import MongooseChangeTracking, { ChangeTrackingInstanceMethods, ChangeTrackingModel, ChangeTrackingQueryHelper } from '../utils/mongoose-change-tracking/mongoose-change-tracking';
import MongooseMultiLanguage, { MultiLanguageInstanceMethods, MultiLanguageModel, MultiLanguageQueryHelper } from '../utils/mongoose-multi-language/mongoose-multi-language';
import MongooseSearch, { SearchInstanceMethods, SearchModel, SearchQueryHelper } from '../utils/mongoose-search/mongoose-search';
import AnimeEntry, { TAnimeEntry } from './anime-entry.model';
import { TChange } from './change.model';
import Episode, { TEpisode } from './episode.model';
import { TFranchise } from './franchise.model';
import { TGenre } from './genre.model';
import Review, { TReview } from './review.model';
import Season, { TSeason } from './season.model';
import { TStaff } from './staff.model';
import { TTheme } from './theme.model';

enum AnimeStatus {
  Airing = 'airing',
  Finished = 'finished',
  Unreleased = 'unreleased',
  Upcoming = 'upcoming',
}

enum AnimeType {
  Tv = 'tv',
  Ova = 'ova',
  Ona = 'ona',
  Movie = 'movie',
  Music = 'music',
  Special = 'special',
}

export interface IAnime {
  _id: Types.ObjectId;

  title: Map<string, string>;
  overview: Map<string, string>;
  startDate: Map<string, Date>;
  endDate: Map<string, Date | null>;
  origin: string[];
  animeType: AnimeType;
  status: AnimeStatus;
  inProduction: boolean;
  youtubeVideoId: string;
  poster: Map<string, string | null>;
  banner: Map<string, string | null>;
  links: Map<string, string>;

  seasonCount: number;
  episodeCount: number;
  episodeLength: number;

  averageRating: number | null;
  ratingRank: number | null;
  popularity: number;
  userCount: number;
  favoritesCount: number;
  reviewCount: number;

  genres: Types.ObjectId[] | TGenre[];
  themes: Types.ObjectId[] | TTheme[];
  seasons?: TSeason[];
  episodes?: TEpisode[];
  staff?: TStaff[];
  reviews?: TReview[];
  franchises?: TFranchise[];
  changes?: TChange[];
  'anime-entry'?: TAnimeEntry | null;

  createdAt: Date;
  updatedAt: Date;
}

export type AnimeInstanceMethods = MultiLanguageInstanceMethods & SearchInstanceMethods & JsonApiInstanceMethods & ChangeTrackingInstanceMethods

export type AnimeQueryHelper = MultiLanguageQueryHelper & SearchQueryHelper & JsonApiQueryHelper & ChangeTrackingQueryHelper

export type AnimeModel = Model<IAnime, AnimeQueryHelper, AnimeInstanceMethods> & MultiLanguageModel<IAnime> & SearchModel<IAnime> & JsonApiModel<IAnime> & ChangeTrackingModel<IAnime>

export const AnimeSchema = new Schema<IAnime, AnimeModel, AnimeInstanceMethods, AnimeQueryHelper>({
  title: {
    type: Map,
    of: String,
    default: {},
    validate: {
      validator: function (value: IAnime['title']) {
        return value.size > 0 && Array.from(value.values()).every((v) => !!v);
      },
      message: 'Invalid title',
    },
  },

  overview: {
    type: Map,
    of: String,
    default: {},
    validate: {
      validator: function (value: IAnime['overview']) {
        return value.size > 0 && Array.from(value.values()).every((v) => !!v);
      },
      message: 'Invalid overview',
    },
  },

  startDate: {
    type: Map,
    of: Date,
    default: {},
    validate: {
      validator: function (value: IAnime['startDate']) {
        return value.size > 0 && Array.from(value.values()).every((v) => !!v);
      },
      message: 'Invalid startDate',
    },
    transform: function (this, val: IAnime['startDate']) {
      return Object.fromEntries(
        Array.from(val.entries()).map(([key, value]) => [key, value?.toISOString().slice(0, 10) ?? null])
      );
    },
  },

  endDate: {
    type: Map,
    of: Date,
    default: {},
    transform: function (this, val: IAnime['endDate']) {
      return Object.fromEntries(
        Array.from(val.entries()).map(([key, value]) => [key, value?.toISOString().slice(0, 10) ?? null])
      );
    },
  },

  origin: {
    type: [String],
    default: [],
  },

  animeType: {
    type: String,
    required: true,
    enum: Object.values(AnimeType),
  },

  status: {
    type: String,
    required: true,
    enum: Object.values(AnimeStatus),
  },

  inProduction: {
    type: Boolean,
    required: true,
  },

  youtubeVideoId: {
    type: String,
    default: '',
  },

  poster: {
    type: Map,
    of: String,
    default: {},
  },

  banner: {
    type: Map,
    of: String,
    default: {},
  },

  links: {
    type: Map,
    of: String,
    default: {},
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
  foreignField: 'anime',
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
  foreignField: 'source',
});

AnimeSchema.virtual('changes', {
  ref: 'Change',
  localField: '_id',
  foreignField: 'document',
});

AnimeSchema.virtual('anime-entry');


AnimeSchema.pre<TAnime>('save', async function () {
  if (this.isModified('poster.fr-FR')) {
    this.poster.set('fr-FR', await uploadFile(
      `anime/${this._id}/images/cover.jpg`,
      this.poster.get('fr-FR') ?? null,
    ));
  }

  if (this.isModified('banner.fr-FR')) {
    this.banner.set('fr-FR', await uploadFile(
      `anime/${this._id}/images/banner.jpg`,
      this.banner.get('fr-FR') ?? null,
    ));
  }
});

AnimeSchema.pre('findOne', async function () {
  const _id = this.getFilter()._id;
  if (!_id) return;

  await Anime.findOneAndUpdate(this.getFilter(), {
    seasonCount: await Season.countDocuments({
      anime: _id,
    }),

    episodeCount: await Episode.countDocuments({
      anime: _id,
    }),

    averageRating: await AnimeEntry.aggregate()
      .match({ anime: new Types.ObjectId(_id) })
      .group({
        _id: null,
        averageRating: { $avg: '$rating' },
      })
      .then((docs) => docs[0])
      .then((doc) => doc?.averageRating ?? null),

    userCount: await AnimeEntry.countDocuments({
      anime: _id,
      isAdd: true,
    }),

    favoritesCount: await AnimeEntry.countDocuments({
      anime: _id,
      isFavorites: true,
    }),

    reviewCount: await Review.countDocuments({
      anime: _id,
    }),

    popularity: await Anime.aggregate()
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
            { $multiply: [2, '$entriesCount', { $ifNull: ['$averageRating', 0] }, { $add: ['$userCount', '$favoritesCount'] }] },
          ],
        },
      })
      .then((docs) => docs[0])
      .then((doc) => doc?.popularity ?? 0),
  });
});

AnimeSchema.pre<TAnime>('deleteOne', async function () {
  if (this.poster.get('fr-FR')) {
    await deleteFile(
      `anime/${this._id}/images/cover.jpg`,
    );
  }

  if (this.banner.get('fr-FR')) {
    await deleteFile(
      `anime/${this._id}/images/banner.jpg`,
    );
  }
});


AnimeSchema.plugin(MongooseMultiLanguage, {
  fields: ['title', 'overview', 'startDate', 'endDate', 'poster', 'banner'],
});

AnimeSchema.plugin(MongooseSearch, {
  fields: ['title'],
});

AnimeSchema.plugin(MongooseJsonApi, {
  type: 'anime',
  filter: {
    query: (query: string) => {
      return {
        $search: query,
      };
    }
  },
});

AnimeSchema.plugin(MongooseChangeTracking);


export type TAnime = HydratedDocument<IAnime, AnimeInstanceMethods, AnimeQueryHelper>;

const Anime = model<IAnime, AnimeModel>('Anime', AnimeSchema);
export default Anime;
