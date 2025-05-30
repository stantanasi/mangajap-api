import MongooseJsonApi, { JsonApiInstanceMethods, JsonApiModel, JsonApiQueryHelper } from '@stantanasi/mongoose-jsonapi';
import { HydratedDocument, model, Model, Schema, Types } from 'mongoose';
import { deleteFile, uploadFile } from '../firebase-app';
import MongooseChangeTracking, { ChangeTrackingInstanceMethods, ChangeTrackingModel, ChangeTrackingQueryHelper } from '../utils/mongoose-change-tracking/mongoose-change-tracking';
import MongooseMultiLanguage, { MultiLanguageInstanceMethods, MultiLanguageModel, MultiLanguageQueryHelper } from '../utils/mongoose-multi-language/mongoose-multi-language';
import Anime, { TAnime } from './anime.model';
import { TChange } from './change.model';
import EpisodeEntry, { TEpisodeEntry } from './episode-entry.model';
import Season, { TSeason } from './season.model';

export interface IEpisode {
  _id: Types.ObjectId;

  number: number;
  title: Map<string, string>;
  overview: Map<string, string>;
  airDate: Map<string, Date | null>;
  runtime: number;
  episodeType: '' | 'oav';
  poster: Map<string, string | null>;

  rating: number | null;

  anime: Types.ObjectId | TAnime;
  season: Types.ObjectId | TSeason;
  changes?: TChange[];
  'episode-entry'?: TEpisodeEntry | null;

  createdAt: Date;
  updatedAt: Date;
}

export type EpisodeInstanceMethods = MultiLanguageInstanceMethods & JsonApiInstanceMethods & ChangeTrackingInstanceMethods

export type EpisodeQueryHelper = MultiLanguageQueryHelper & JsonApiQueryHelper & ChangeTrackingQueryHelper

export type EpisodeModel = Model<IEpisode, EpisodeQueryHelper, EpisodeInstanceMethods> & MultiLanguageModel<IEpisode> & JsonApiModel<IEpisode> & ChangeTrackingModel<IEpisode> & {
  updateRating: (_id: Types.ObjectId) => Promise<void>;
}

export const EpisodeSchema = new Schema<IEpisode, EpisodeModel, EpisodeInstanceMethods, EpisodeQueryHelper, {}, EpisodeModel>({
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

  airDate: {
    type: Map,
    of: Date,
    default: {},
    transform: function (this, val: IEpisode['airDate']) {
      return Object.fromEntries(
        Array.from(val.entries()).map(([key, value]) => [key, value?.toISOString().slice(0, 10) ?? null])
      );
    },
  },

  runtime: {
    type: Number,
    default: 0,
  },

  episodeType: {
    type: String,
    default: '',
    enum: ['', 'oav'],
  },

  poster: {
    type: Map,
    of: String,
    default: {},
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

  season: {
    type: Schema.Types.ObjectId,
    ref: 'Season',
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

EpisodeSchema.virtual('changes', {
  ref: 'Change',
  localField: '_id',
  foreignField: 'document',
});

EpisodeSchema.virtual('episode-entry');

EpisodeSchema.index({
  number: 1,
  season: 1,
}, { unique: true });


EpisodeSchema.statics.updateRating = async function (_id) {
  await Episode.findByIdAndUpdate(_id, {
    rating: await EpisodeEntry.aggregate()
      .match({ episode: _id })
      .group({
        _id: null,
        rating: { $avg: '$rating' },
      })
      .then((result) => result[0]?.rating ?? null),
  });
};


EpisodeSchema.pre<TEpisode>('save', async function () {
  if (this.isModified('poster.fr-FR')) {
    this.poster.set('fr-FR', await uploadFile(
      `anime/${this.anime}/seasons/${this._id}/images/poster.jpg`,
      this.poster.get('fr-FR') ?? null,
    ));
  }
});

EpisodeSchema.pre<TEpisode>('deleteOne', async function () {
  if (this.poster.get('fr-FR')) {
    await deleteFile(
      `anime/${this.anime}/seasons/${this._id}/images/poster.jpg`,
    );
  }
});

EpisodeSchema.post('save', async function () {
  await Anime.updateStartDate(this.anime._id);
  await Anime.updateEndDate(this.anime._id);
  await Anime.updateEpisodeCount(this.anime._id);

  await Season.updateStartDate(this.season._id);
  await Season.updateEndDate(this.season._id);
  await Season.updateEpisodeCount(this.season._id);
});

EpisodeSchema.post('deleteOne', { document: true, query: false }, async function () {
  await Anime.updateStartDate(this.anime._id);
  await Anime.updateEndDate(this.anime._id);
  await Anime.updateEpisodeCount(this.anime._id);

  await Season.updateStartDate(this.season._id);
  await Season.updateEndDate(this.season._id);
  await Season.updateEpisodeCount(this.season._id);
});


EpisodeSchema.plugin(MongooseMultiLanguage, {
  fields: ['title', 'overview', 'airDate', 'poster'],
});

EpisodeSchema.plugin(MongooseJsonApi, {
  type: 'episodes',
});

EpisodeSchema.plugin(MongooseChangeTracking);


export type TEpisode = HydratedDocument<IEpisode, EpisodeInstanceMethods, EpisodeQueryHelper>;

const Episode = model<IEpisode, EpisodeModel>('Episode', EpisodeSchema);
export default Episode;
