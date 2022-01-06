import { Schema, model, Types } from 'mongoose'
import JsonApiSerializer from "../utils/mongoose-jsonapi/jsonapi-serializer";
import { IAnime } from "./anime.model";
import { IUser } from "./user.model";

export interface IAnimeEntry {
  _id: Types.ObjectId;

  isAdd: boolean;
  isFavorites: boolean;
  status: 'watching' | 'completed' | 'planned' | 'on_hold' | 'dropped';
  episodesWatch: number;
  rating: number | null;
  startedAt: Date | null;
  finishedAt: Date | null;

  user: Types.ObjectId & IUser;
  anime: Types.ObjectId & IAnime;

  createdAt: Date;
  updatedAt: Date;
}

export const AnimeEntrySchema = new Schema<IAnimeEntry>({
  isAdd: {
    type: Boolean,
    default: true
  },

  isFavorites: {
    type: Boolean,
    default: false
  },

  status: {
    type: String,
    default: 'watching',
    enum: ['watching', 'completed', 'planned', 'on_hold', 'dropped']
  },

  episodesWatch: {
    type: Number,
    default: 0
  },

  rating: {
    type: Number,
    default: null
  },

  startedAt: {
    type: Date,
    default: new Date()
  },

  finishedAt: {
    type: Date,
    default: null
  },


  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  anime: {
    type: Schema.Types.ObjectId,
    ref: 'Anime',
    required: true
  },
}, {
  id: false,
  versionKey: false,
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

AnimeEntrySchema.index({
  user: 1,
  anime: 1
}, { unique: true });


export const AnimeEntry = model<IAnimeEntry>('AnimeEntry', AnimeEntrySchema);


JsonApiSerializer.register('anime-entries', AnimeEntry);
