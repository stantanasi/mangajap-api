import { Schema, model, Types, Document } from 'mongoose';
import JsonApiSerializer from "../utils/mongoose-jsonapi/jsonapi-serializer";
import { IAnime } from "./anime.model";
import { ISeason } from "./season.model";

export interface IEpisode extends Document {
  titles: {
    [language: string]: string;
  };
  relativeNumber: number;
  number: number;
  airDate: Date | null;
  episodeType: '' | 'oav';

  anime: Types.ObjectId & IAnime;
  season: Types.ObjectId & ISeason;

  createdAt: Date;
  updatedAt: Date;
}

export const EpisodeSchema = new Schema<IEpisode>({
  titles: {
    type: Schema.Types.Mixed,
    default: {},
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
    transform: function (this, val) {
      return val?.toISOString().slice(0, 10) ?? null;
    },
  },

  episodeType: {
    type: String,
    default: '',
    enum: ['', 'oav']
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


const Episode = model<IEpisode>('Episode', EpisodeSchema);
export default Episode;


JsonApiSerializer.register('episodes', Episode);
