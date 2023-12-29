import { Schema, model, Model, Types } from 'mongoose';
import MongooseJsonApi, { JsonApiInstanceMethods, JsonApiModel, JsonApiQueryHelper } from '../utils/mongoose-jsonapi/mongoose-jsonapi';
import { IAnime } from "./anime.model";
import { ISeason } from "./season.model";

export interface IEpisode {
  _id: Types.ObjectId;

  titles: {
    [language: string]: string;
  };
  overview: string;
  relativeNumber: number;
  number: number;
  airDate: Date | null;
  episodeType: '' | 'oav';
  duration: number;

  anime: Types.ObjectId | IAnime;
  season: Types.ObjectId | ISeason;

  createdAt: Date;
  updatedAt: Date;
}

export interface EpisodeInstanceMethods extends Document, JsonApiInstanceMethods {
}

export interface EpisodeQueryHelper extends JsonApiQueryHelper {
}

export interface EpisodeModel extends Model<IEpisode, EpisodeQueryHelper, EpisodeInstanceMethods> {
}

export const EpisodeSchema = new Schema<IEpisode, EpisodeModel & JsonApiModel<IEpisode>, EpisodeInstanceMethods, EpisodeQueryHelper>({
  titles: {
    type: Schema.Types.Mixed,
    default: {},
  },

  overview: {
    type: String,
    default: '',
  },

  relativeNumber: {
    type: Number,
    required: true
  },

  number: {
    type: Number,
    required: true
  },

  airDate: {
    type: Date,
    default: null,
    transform: function (this, val: Date | null | undefined) {
      return val?.toISOString().slice(0, 10) ?? val;
    },
  },

  episodeType: {
    type: String,
    default: '',
    enum: ['', 'oav']
  },

  duration: {
    type: Number,
    default: 0,
  },


  anime: {
    type: Schema.Types.ObjectId,
    ref: 'Anime',
    required: true
  },

  season: {
    type: Schema.Types.ObjectId,
    ref: 'Season',
    required: true
  },
}, {
  id: false,
  versionKey: false,
  timestamps: true,
  minimize: false,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

EpisodeSchema.index({
  number: 1,
  anime: 1
}, { unique: true });

EpisodeSchema.index({
  relativeNumber: 1,
  season: 1
}, { unique: true });


EpisodeSchema.plugin(MongooseJsonApi, {
  type: 'episodes',
});


const Episode = model<IEpisode, EpisodeModel & JsonApiModel<IEpisode>>('Episode', EpisodeSchema);
export default Episode;
