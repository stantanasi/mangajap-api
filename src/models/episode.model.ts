import { HydratedDocument, model, Model, Schema, Types } from "mongoose";
import MongooseJsonApi, { JsonApiInstanceMethods, JsonApiModel, JsonApiQueryHelper } from "../utils/mongoose-jsonapi/mongoose-jsonapi";
import { TAnime } from "./anime.model";
import { TEpisodeEntry } from "./episode-entry.model";
import { TSeason } from "./season.model";

enum EpisodeType {
  None = "",
  Oav = "oav",
}

export interface IEpisode {
  _id: Types.ObjectId;

  titles: {
    [language: string]: string;
  };
  overview: string;
  relativeNumber: number;
  number: number;
  airDate: Date | null;
  episodeType: EpisodeType;
  duration: number;

  anime: Types.ObjectId | TAnime;
  season: Types.ObjectId | TSeason;
  "episode-entry"?: TEpisodeEntry | null;

  createdAt: Date;
  updatedAt: Date;
}

export type EpisodeInstanceMethods = JsonApiInstanceMethods

export type EpisodeQueryHelper = JsonApiQueryHelper

export type EpisodeModel = Model<IEpisode, EpisodeQueryHelper, EpisodeInstanceMethods> & JsonApiModel<IEpisode>

export const EpisodeSchema = new Schema<IEpisode, EpisodeModel, EpisodeInstanceMethods, EpisodeQueryHelper>({
  titles: {
    type: Schema.Types.Mixed,
    default: {},
  },

  overview: {
    type: String,
    default: "",
  },

  relativeNumber: {
    type: Number,
    required: true,
  },

  number: {
    type: Number,
    required: true,
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
    default: EpisodeType.None,
    enum: Object.values(EpisodeType),
  },

  duration: {
    type: Number,
    default: 0,
  },


  anime: {
    type: Schema.Types.ObjectId,
    ref: "Anime",
    required: true,
  },

  season: {
    type: Schema.Types.ObjectId,
    ref: "Season",
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

EpisodeSchema.virtual("episode-entry");

EpisodeSchema.index({
  number: 1,
  anime: 1,
}, { unique: true });

EpisodeSchema.index({
  relativeNumber: 1,
  season: 1,
}, { unique: true });


EpisodeSchema.plugin(MongooseJsonApi, {
  type: "episodes",
});


export type TEpisode = HydratedDocument<IEpisode, EpisodeInstanceMethods, EpisodeQueryHelper>;

const Episode = model<IEpisode, EpisodeModel>("Episode", EpisodeSchema);
export default Episode;
