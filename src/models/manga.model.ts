import MongooseJsonApi, { JsonApiInstanceMethods, JsonApiModel, JsonApiQueryHelper } from '@stantanasi/mongoose-jsonapi';
import { HydratedDocument, model, Model, Schema, Types } from 'mongoose';
import { deleteFile, uploadFile } from '../firebase-app';
import MongooseChangeTracking, { ChangeTrackingInstanceMethods, ChangeTrackingModel, ChangeTrackingQueryHelper } from '../utils/mongoose-change-tracking/mongoose-change-tracking';
import MongooseMultiLanguage, { MultiLanguageInstanceMethods, MultiLanguageModel, MultiLanguageQueryHelper } from '../utils/mongoose-multi-language/mongoose-multi-language';
import MongooseSearch, { SearchInstanceMethods, SearchModel, SearchQueryHelper } from '../utils/mongoose-search/mongoose-search';
import { TChange } from './change.model';
import Chapter, { TChapter } from './chapter.model';
import { TFranchise } from './franchise.model';
import { TGenre } from './genre.model';
import MangaEntry, { TMangaEntry } from './manga-entry.model';
import Review, { TReview } from './review.model';
import { TStaff } from './staff.model';
import { TTheme } from './theme.model';
import Volume, { TVolume } from './volume.model';

export interface IManga {
  _id: Types.ObjectId;

  title: Map<string, string>;
  overview: Map<string, string>;
  origin: string[];
  mangaType: 'bd' | 'comics' | 'josei' | 'kodomo' | 'seijin' | 'seinen' | 'shojo' | 'shonen' | 'doujin' | 'novel' | 'oneshot' | 'webtoon';
  status: 'publishing' | 'finished';
  poster: Map<string, string | null>;
  banner: Map<string, string | null>;
  links: Map<string, string>;

  startDate: Map<string, Date | null>;
  endDate: Map<string, Date | null>;
  volumeCount: number;
  chapterCount: number;
  averageRating: number | null;
  userCount: number;
  favoritesCount: number;
  reviewCount: number;
  popularity: number;

  genres: Types.ObjectId[] | TGenre[];
  themes: Types.ObjectId[] | TTheme[];
  volumes?: TVolume[];
  chapters?: TChapter[];
  staff?: TStaff[];
  reviews?: TReview[];
  franchises?: TFranchise[];
  changes?: TChange[];
  'manga-entry'?: TMangaEntry | null;

  createdAt: Date;
  updatedAt: Date;
}

export type MangaInstanceMethods = MultiLanguageInstanceMethods & SearchInstanceMethods & JsonApiInstanceMethods & ChangeTrackingInstanceMethods;

export type MangaQueryHelper = MultiLanguageQueryHelper & SearchQueryHelper & JsonApiQueryHelper & ChangeTrackingQueryHelper;

export type MangaModel = Model<IManga, MangaQueryHelper, MangaInstanceMethods> & MultiLanguageModel<IManga> & SearchModel<IManga> & JsonApiModel<IManga> & ChangeTrackingModel<IManga> & {
  updateStartDate: (_id: Types.ObjectId) => Promise<void>;

  updateEndDate: (_id: Types.ObjectId) => Promise<void>;

  updateVolumeCount: (_id: Types.ObjectId) => Promise<void>;

  updateChapterCount: (_id: Types.ObjectId) => Promise<void>;

  updateAverageRating: (_id: Types.ObjectId) => Promise<void>;

  updateUserCount: (_id: Types.ObjectId) => Promise<void>;

  updateFavoritesCount: (_id: Types.ObjectId) => Promise<void>;

  updateReviewCount: (_id: Types.ObjectId) => Promise<void>;

  updatePopularity: (_id: Types.ObjectId) => Promise<void>;
};

export const MangaSchema = new Schema<IManga, MangaModel, MangaInstanceMethods, MangaQueryHelper, {}, MangaModel>({
  title: {
    type: Map,
    of: String,
    default: {},
    validate: {
      validator: function (value: IManga['title']) {
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
      validator: function (value: IManga['overview']) {
        return value.size > 0 && Array.from(value.values()).every((v) => !!v);
      },
      message: 'Invalid overview',
    },
  },

  origin: {
    type: [String],
    default: [],
  },

  mangaType: {
    type: String,
    required: true,
    enum: ['bd', 'comics', 'josei', 'kodomo', 'seijin', 'seinen', 'shojo', 'shonen', 'doujin', 'novel', 'oneshot', 'webtoon'],
  },

  status: {
    type: String,
    required: true,
    enum: ['publishing', 'finished'],
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


  startDate: {
    type: Map,
    of: Date,
    default: {},
    transform: function (this, val: IManga['startDate']) {
      return Object.fromEntries(
        Array.from(val.entries()).map(([key, value]) => [key, value?.toISOString().slice(0, 10) ?? null])
      );
    },
  },

  endDate: {
    type: Map,
    of: Date,
    default: {},
    transform: function (this, val: IManga['endDate']) {
      return Object.fromEntries(
        Array.from(val.entries()).map(([key, value]) => [key, value?.toISOString().slice(0, 10) ?? null])
      );
    },
  },

  volumeCount: {
    type: Number,
    default: 0,
  },

  chapterCount: {
    type: Number,
    default: 0,
  },

  averageRating: {
    type: Number,
    default: null,
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

  popularity: {
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

MangaSchema.virtual('volumes', {
  ref: 'Volume',
  localField: '_id',
  foreignField: 'manga',
  options: {
    sort: { number: 1 },
  },
});

MangaSchema.virtual('chapters', {
  ref: 'Chapter',
  localField: '_id',
  foreignField: 'manga',
  options: {
    sort: { number: 1 },
  },
});

MangaSchema.virtual('staff', {
  ref: 'Staff',
  localField: '_id',
  foreignField: 'manga',
});

MangaSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'manga',
  options: {
    sort: { updatedAt: -1 },
  },
});

MangaSchema.virtual('franchises', {
  ref: 'Franchise',
  localField: '_id',
  foreignField: 'source',
});

MangaSchema.virtual('changes', {
  ref: 'Change',
  localField: '_id',
  foreignField: 'document',
});

MangaSchema.virtual('manga-entry');


MangaSchema.statics.updateStartDate = async function (_id) {
  const [firstVolume, firstChapter] = await Promise.all([
    Volume.findOne({
      manga: _id,
    }).sort({ number: 1 }),
    Chapter.findOne({
      manga: _id,
    }).sort({ number: 1 }),
  ]);

  await Manga.findByIdAndUpdate(_id, {
    startDate: [
      ...firstVolume?.publishedDate.keys() ?? [],
      ...firstChapter?.publishedDate.keys() ?? [],
    ]
      .reduce<IManga['startDate']>((acc, key) => {
        const date1 = firstVolume?.publishedDate.get(key) ?? null;
        const date2 = firstChapter?.publishedDate.get(key) ?? null;
        acc.set(
          key,
          date1 && date2
            ? date1 < date2 ? date1 : date2
            : date1 ?? date2
        );
        return acc;
      }, new Map()),
  });
};

MangaSchema.statics.updateEndDate = async function (_id) {
  const [lastVolume, lastChapter] = await Promise.all([
    Volume.findOne({
      manga: _id,
    }).sort({ number: -1 }),
    Chapter.findOne({
      manga: _id,
    }).sort({ number: -1 }),
  ]);

  await Manga.findByIdAndUpdate(_id, {
    endDate: [
      ...lastVolume?.publishedDate.keys() ?? [],
      ...lastChapter?.publishedDate.keys() ?? [],
    ]
      .reduce<IManga['startDate']>((acc, key) => {
        const date1 = lastVolume?.publishedDate.get(key) ?? null;
        const date2 = lastChapter?.publishedDate.get(key) ?? null;
        acc.set(
          key,
          date1 && date2
            ? date1 > date2 ? date1 : date2
            : date1 ?? date2
        );
        return acc;
      }, new Map()),
  });
};

MangaSchema.statics.updateVolumeCount = async function (_id) {
  await Manga.findByIdAndUpdate(_id, {
    volumeCount: await Volume.countDocuments({
      manga: _id,
    }),
  });
};

MangaSchema.statics.updateChapterCount = async function (_id) {
  await Manga.findByIdAndUpdate(_id, {
    chapterCount: await Chapter.countDocuments({
      manga: _id,
    }),
  });
};

MangaSchema.statics.updateAverageRating = async function (_id) {
  await Manga.findByIdAndUpdate(_id, {
    averageRating: await MangaEntry.aggregate()
      .match({ manga: _id })
      .group({
        _id: null,
        averageRating: { $avg: '$rating' },
      })
      .then((docs) => docs[0])
      .then((doc) => doc?.averageRating ?? null),
  });
};

MangaSchema.statics.updateUserCount = async function (_id) {
  await Manga.findByIdAndUpdate(_id, {
    userCount: await MangaEntry.countDocuments({
      manga: _id,
      isAdd: true,
    }),
  });
};

MangaSchema.statics.updateFavoritesCount = async function (_id) {
  await Manga.findByIdAndUpdate(_id, {
    favoritesCount: await MangaEntry.countDocuments({
      manga: _id,
      isFavorites: true,
    }),
  });
};

MangaSchema.statics.updateReviewCount = async function (_id) {
  await Manga.findByIdAndUpdate(_id, {
    reviewCount: await Review.countDocuments({
      manga: _id,
    }),
  });
};

MangaSchema.statics.updatePopularity = async function (_id) {
  await Manga.findByIdAndUpdate(_id, {
    popularity: await Manga.aggregate()
      .match({ _id: _id })
      .lookup({
        from: 'mangaentries',
        localField: '_id',
        foreignField: 'manga',
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
};


MangaSchema.pre<TManga>('save', async function () {
  if (this.isModified('poster.fr-FR')) {
    this.poster.set('fr-FR', await uploadFile(
      `manga/${this._id}/images/cover.jpg`,
      this.poster.get('fr-FR') ?? null,
    ));
  }

  if (this.isModified('banner.fr-FR')) {
    this.banner.set('fr-FR', await uploadFile(
      `manga/${this._id}/images/banner.jpg`,
      this.banner.get('fr-FR') ?? null,
    ));
  }
});

MangaSchema.pre<TManga>('deleteOne', async function () {
  if (this.poster.get('fr-FR')) {
    await deleteFile(
      `manga/${this._id}/images/cover.jpg`,
    );
  }

  if (this.banner.get('fr-FR')) {
    await deleteFile(
      `manga/${this._id}/images/banner.jpg`,
    );
  }
});


MangaSchema.plugin(MongooseMultiLanguage, {
  fields: ['title', 'overview', 'startDate', 'endDate', 'poster', 'banner'],
});

MangaSchema.plugin(MongooseSearch, {
  fields: ['title'],
});

MangaSchema.plugin(MongooseJsonApi, {
  type: 'manga',
  filter: {
    query: (query: string) => {
      return {
        $search: query,
      };
    },
  },
});

MangaSchema.plugin(MongooseChangeTracking);


export type TManga = HydratedDocument<IManga, MangaInstanceMethods, MangaQueryHelper>;

const Manga = model<IManga, MangaModel>('Manga', MangaSchema);
export default Manga;
