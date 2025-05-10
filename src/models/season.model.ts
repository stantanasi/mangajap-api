import MongooseJsonApi, { JsonApiInstanceMethods, JsonApiModel, JsonApiQueryHelper } from '@stantanasi/mongoose-jsonapi';
import { HydratedDocument, model, Model, Schema, Types } from 'mongoose';
import { deleteFile, uploadFile } from '../firebase-app';
import MongooseChangeTracking, { ChangeTrackingInstanceMethods, ChangeTrackingModel, ChangeTrackingQueryHelper } from '../utils/mongoose-change-tracking/mongoose-change-tracking';
import MongooseMultiLanguage, { MultiLanguageInstanceMethods, MultiLanguageModel, MultiLanguageQueryHelper } from '../utils/mongoose-multi-language/mongoose-multi-language';
import Anime, { TAnime } from './anime.model';
import { TChange } from './change.model';
import Episode, { TEpisode } from './episode.model';
import EpisodeEntry from './episode-entry.model';

export interface ISeason {
  _id: Types.ObjectId;

  number: number;
  title: Map<string, string>;
  overview: Map<string, string>;
  poster: Map<string, string | null>;

  airDate: Map<string, Date | null>;
  episodeCount: number;
  rating: number | null;

  anime: Types.ObjectId | TAnime;
  episodes?: TEpisode[];
  changes?: TChange[];

  createdAt: Date;
  updatedAt: Date;
}

export type SeasonInstanceMethods = MultiLanguageInstanceMethods & JsonApiInstanceMethods & ChangeTrackingInstanceMethods

export type SeasonQueryHelper = MultiLanguageQueryHelper & JsonApiQueryHelper & ChangeTrackingQueryHelper

export type SeasonModel = Model<ISeason, SeasonQueryHelper, SeasonInstanceMethods> & MultiLanguageModel<ISeason> & JsonApiModel<ISeason> & ChangeTrackingModel<ISeason> & {
  updateAirDate: (_id: Types.ObjectId) => Promise<void>;

  updateEpisodeCount: (_id: Types.ObjectId) => Promise<void>;

  updateRating: (_id: Types.ObjectId) => Promise<void>;
}

export const SeasonSchema = new Schema<ISeason, SeasonModel, SeasonInstanceMethods, SeasonQueryHelper, {}, SeasonModel>({
  number: {
    type: Number,
    required: true,
  },

  title: {
    type: Map,
    of: String,
    default: {},
  },

  overview: {
    type: Map,
    of: String,
    default: {},
  },

  poster: {
    type: Map,
    of: String,
    default: {},
  },


  airDate: {
    type: Map,
    of: Date,
    default: {},
    transform: function (this, val: ISeason['airDate']) {
      return Object.fromEntries(
        Array.from(val.entries()).map(([key, value]) => [key, value?.toISOString().slice(0, 10) ?? null])
      );
    },
  },

  episodeCount: {
    type: Number,
    default: 0,
  },

  rating: {
    type: Number,
    default: null,
  },


  anime: {
    type: Schema.Types.ObjectId,
    ref: 'Anime',
    required: true,
  },
}, {
  id: false,
  versionKey: false,
  timestamps: true,
  minimize: false,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

SeasonSchema.virtual('episodes', {
  ref: 'Episode',
  localField: '_id',
  foreignField: 'season',
  options: {
    sort: { number: 1 },
  },
});

SeasonSchema.virtual('changes', {
  ref: 'Change',
  localField: '_id',
  foreignField: 'document',
});

SeasonSchema.index({
  number: 1,
  anime: 1,
}, { unique: true });


SeasonSchema.statics.updateAirDate = async function (_id) {
  await Season.findByIdAndUpdate(_id, {
    airDate: await Episode.findOne({
      season: _id,
    }).sort({ number: 1 }).then((doc) => doc?.airDate ?? {}),
  });
};

SeasonSchema.statics.updateEpisodeCount = async function (_id) {
  await Season.findByIdAndUpdate(_id, {
    episodeCount: await Episode.countDocuments({
      season: _id,
    }),
  });
};

SeasonSchema.statics.updateRating = async function (_id) {
  await Season.findByIdAndUpdate(_id, {
    rating: await Episode.aggregate()
      .match({ season: _id })
      .lookup({
        from: 'episodeentries',
        localField: '_id',
        foreignField: 'episode',
        as: 'entries',
      })
      .unwind('$entries')
      .group({
        _id: null,
        rating: { $avg: '$entries.rating' },
      })
      .then((result) => result[0].rating ?? null),
  });
};


SeasonSchema.pre<TSeason>('save', async function () {
  if (this.isModified('poster.fr-FR')) {
    this.poster.set('fr-FR', await uploadFile(
      `anime/${this.anime}/seasons/${this._id}/images/poster.jpg`,
      this.poster.get('fr-FR') ?? null,
    ));
  }
});

SeasonSchema.pre<TSeason>('deleteOne', async function () {
  if (this.poster.get('fr-FR')) {
    await deleteFile(
      `anime/${this.anime}/seasons/${this._id}/images/poster.jpg`,
    );
  }
});

SeasonSchema.post('save', async function () {
  await Anime.updateSeasonCount(this.anime._id);
});

SeasonSchema.post('deleteOne', { document: true, query: false }, async function () {
  await Anime.updateSeasonCount(this.anime._id);
});


SeasonSchema.plugin(MongooseMultiLanguage, {
  fields: ['title', 'overview', 'airDate', 'poster'],
});

SeasonSchema.plugin(MongooseJsonApi, {
  type: 'seasons',
});

SeasonSchema.plugin(MongooseChangeTracking);


export type TSeason = HydratedDocument<ISeason, SeasonInstanceMethods, SeasonQueryHelper>;

const Season = model<ISeason, SeasonModel>('Season', SeasonSchema);
export default Season;
