import MongooseJsonApi, { JsonApiInstanceMethods, JsonApiModel, JsonApiQueryHelper } from '@stantanasi/mongoose-jsonapi';
import { HydratedDocument, model, Model, Schema, Types } from 'mongoose';
import MongooseMultiLanguage, { MultiLanguageInstanceMethods, MultiLanguageModel, MultiLanguageQueryHelper } from '../utils/mongoose-multi-language/mongoose-multi-language';
import Anime, { TAnime } from './anime.model';
import { TUser } from './user.model';

enum AnimeEntryStatus {
  Watching = 'watching',
  Completed = 'completed',
  Planned = 'planned',
  OnHold = 'on_hold',
  Dropped = 'dropped',
}

export interface IAnimeEntry {
  _id: Types.ObjectId;

  isAdd: boolean;
  isFavorites: boolean;
  status: AnimeEntryStatus;
  episodesWatch: number;
  rating: number | null;
  startedAt: Date | null;
  finishedAt: Date | null;

  user: string | TUser;
  anime: Types.ObjectId | TAnime;

  createdAt: Date;
  updatedAt: Date;
}

export type AnimeEntryInstanceMethods = MultiLanguageInstanceMethods & JsonApiInstanceMethods

export type AnimeEntryQueryHelper = MultiLanguageQueryHelper & JsonApiQueryHelper

export type AnimeEntryModel = Model<IAnimeEntry, AnimeEntryQueryHelper, AnimeEntryInstanceMethods> & MultiLanguageModel<IAnimeEntry> & JsonApiModel<IAnimeEntry>

export const AnimeEntrySchema = new Schema<IAnimeEntry, AnimeEntryModel, AnimeEntryInstanceMethods, AnimeEntryQueryHelper, {}, AnimeEntryModel>({
  isAdd: {
    type: Boolean,
    default: true,
  },

  isFavorites: {
    type: Boolean,
    default: false,
  },

  status: {
    type: String,
    default: AnimeEntryStatus.Watching,
    enum: Object.values(AnimeEntryStatus),
  },

  episodesWatch: {
    type: Number,
    default: 0,
  },

  rating: {
    type: Number,
    default: null,
  },

  startedAt: {
    type: Date,
    default: new Date(),
  },

  finishedAt: {
    type: Date,
    default: null,
  },


  user: {
    type: String,
    ref: 'User',
    required: true,
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

AnimeEntrySchema.index({
  user: 1,
  anime: 1,
}, { unique: true });


AnimeEntrySchema.post('save', async function () {
  await Anime.updateAverageRating(this.anime._id);
  await Anime.updateUserCount(this.anime._id);
  await Anime.updateFavoritesCount(this.anime._id);
  await Anime.updatePopularity(this.anime._id);
});

AnimeEntrySchema.post('deleteOne', { document: true, query: false }, async function () {
  await Anime.updateAverageRating(this.anime._id);
  await Anime.updateUserCount(this.anime._id);
  await Anime.updateFavoritesCount(this.anime._id);
  await Anime.updatePopularity(this.anime._id);
});


AnimeEntrySchema.plugin(MongooseMultiLanguage, {
  fields: [],
});

AnimeEntrySchema.plugin(MongooseJsonApi, {
  type: 'anime-entries',
});


export type TAnimeEntry = HydratedDocument<IAnimeEntry, AnimeEntryInstanceMethods, AnimeEntryQueryHelper>;

const AnimeEntry = model<IAnimeEntry, AnimeEntryModel>('AnimeEntry', AnimeEntrySchema);
export default AnimeEntry;
