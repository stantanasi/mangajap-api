import { Schema, model, Model, Types } from 'mongoose';
import MongooseJsonApi, { JsonApiInstanceMethods, JsonApiModel, JsonApiQueryHelper } from '../utils/mongoose-jsonapi/mongoose-jsonapi';
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

  user: string | IUser;
  anime: Types.ObjectId | IAnime;

  createdAt: Date;
  updatedAt: Date;
}

export interface AnimeEntryInstanceMethods extends Document, JsonApiInstanceMethods {
}

export interface AnimeEntryQueryHelper extends JsonApiQueryHelper {
}

export interface AnimeEntryModel extends Model<IAnimeEntry, AnimeEntryQueryHelper, AnimeEntryInstanceMethods> {
}

export const AnimeEntrySchema = new Schema<IAnimeEntry, AnimeEntryModel & JsonApiModel<IAnimeEntry>, AnimeEntryInstanceMethods, AnimeEntryQueryHelper>({
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
    type: String,
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
  minimize: false,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

AnimeEntrySchema.index({
  user: 1,
  anime: 1
}, { unique: true });


AnimeEntrySchema.plugin(MongooseJsonApi, {
  type: 'anime-entries',
});


const AnimeEntry = model<IAnimeEntry, AnimeEntryModel & JsonApiModel<IAnimeEntry>>('AnimeEntry', AnimeEntrySchema);
export default AnimeEntry;
