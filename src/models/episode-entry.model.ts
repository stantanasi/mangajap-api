import { HydratedDocument, model, Model, Schema, Types } from "mongoose";
import MongooseJsonApi, { JsonApiInstanceMethods, JsonApiModel, JsonApiQueryHelper } from "../utils/mongoose-jsonapi/mongoose-jsonapi";
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

export interface EpisodeEntryInstanceMethods extends JsonApiInstanceMethods { }

export interface EpisodeEntryQueryHelper extends JsonApiQueryHelper { }

export interface EpisodeEntryModel extends Model<IEpisodeEntry, EpisodeEntryQueryHelper, EpisodeEntryInstanceMethods> { }

export const EpisodeEntrySchema = new Schema<IEpisodeEntry, EpisodeEntryModel & JsonApiModel<IEpisodeEntry>, EpisodeEntryInstanceMethods, EpisodeEntryQueryHelper>({
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


EpisodeEntrySchema.plugin(MongooseJsonApi, {
  type: "episode-entries",
});


export type TEpisodeEntry = HydratedDocument<IEpisodeEntry, EpisodeEntryInstanceMethods, EpisodeEntryQueryHelper>;

const EpisodeEntry = model<IEpisodeEntry, EpisodeEntryModel & JsonApiModel<IEpisodeEntry>>("EpisodeEntry", EpisodeEntrySchema);
export default EpisodeEntry;
