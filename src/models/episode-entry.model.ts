import MongooseJsonApi, { JsonApiInstanceMethods, JsonApiModel, JsonApiQueryHelper } from "@stantanasi/mongoose-jsonapi";
import { HydratedDocument, model, Model, Schema, Types } from "mongoose";
import MongooseMultiLanguage, { MultiLanguageInstanceMethods, MultiLanguageModel, MultiLanguageQueryHelper } from "../utils/mongoose-multi-language/mongoose-multi-language";
import { TEpisode } from "./episode.model";
import { TUser } from "./user.model";

export interface IEpisodeEntry {
  _id: Types.ObjectId;

  watchedDate: Date;
  watchedCount: number;
  rating: number | null;

  user: string | TUser;
  episode: Types.ObjectId | TEpisode;

  createdAt: Date;
  updatedAt: Date;
}

export type EpisodeEntryInstanceMethods = MultiLanguageInstanceMethods & JsonApiInstanceMethods

export type EpisodeEntryQueryHelper = MultiLanguageQueryHelper & JsonApiQueryHelper

export type EpisodeEntryModel = Model<IEpisodeEntry, EpisodeEntryQueryHelper, EpisodeEntryInstanceMethods> & MultiLanguageModel<IEpisodeEntry> & JsonApiModel<IEpisodeEntry>

export const EpisodeEntrySchema = new Schema<IEpisodeEntry, EpisodeEntryModel, EpisodeEntryInstanceMethods, EpisodeEntryQueryHelper>({
  watchedDate: {
    type: Date,
    default: new Date(),
  },

  watchedCount: {
    type: Number,
    default: 1,
  },

  rating: {
    type: Number,
    default: null,
  },


  user: {
    type: String,
    ref: "User",
    required: true,
  },

  episode: {
    type: Schema.Types.ObjectId,
    ref: "Episode",
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

EpisodeEntrySchema.index({
  user: 1,
  episode: 1,
}, { unique: true });


EpisodeEntrySchema.plugin(MongooseMultiLanguage, {
  fields: [],
});

EpisodeEntrySchema.plugin(MongooseJsonApi, {
  type: "episode-entries",
});


export type TEpisodeEntry = HydratedDocument<IEpisodeEntry, EpisodeEntryInstanceMethods, EpisodeEntryQueryHelper>;

const EpisodeEntry = model<IEpisodeEntry, EpisodeEntryModel>("EpisodeEntry", EpisodeEntrySchema);
export default EpisodeEntry;
