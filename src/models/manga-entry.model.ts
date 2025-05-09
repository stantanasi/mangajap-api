import MongooseJsonApi, { JsonApiInstanceMethods, JsonApiModel, JsonApiQueryHelper } from '@stantanasi/mongoose-jsonapi';
import { HydratedDocument, model, Model, Schema, Types } from 'mongoose';
import MongooseMultiLanguage, { MultiLanguageInstanceMethods, MultiLanguageModel, MultiLanguageQueryHelper } from '../utils/mongoose-multi-language/mongoose-multi-language';
import { TManga } from './manga.model';
import { TUser } from './user.model';

enum MangaEntryStatus {
  Reading = 'reading',
  Completed = 'completed',
  Planned = 'planned',
  OnHold = 'on_hold',
  Dropped = 'dropped',
}

export interface IMangaEntry {
  _id: Types.ObjectId;

  isAdd: boolean;
  isFavorites: boolean;
  status: MangaEntryStatus;
  volumesRead: number;
  chaptersRead: number;
  rating: number | null;
  startedAt: Date | null;
  finishedAt: Date | null;

  user: string | TUser;
  manga: Types.ObjectId | TManga;

  createdAt: Date;
  updatedAt: Date;
}

export type MangaEntryInstanceMethods = MultiLanguageInstanceMethods & JsonApiInstanceMethods

export type MangaEntryQueryHelper = MultiLanguageQueryHelper & JsonApiQueryHelper

export type MangaEntryModel = Model<IMangaEntry, MangaEntryQueryHelper, MangaEntryInstanceMethods> & MultiLanguageModel<IMangaEntry> & JsonApiModel<IMangaEntry>

export const MangaEntrySchema = new Schema<IMangaEntry, MangaEntryModel, MangaEntryInstanceMethods, MangaEntryQueryHelper>({
  isAdd: {
    type: Boolean,
    default: false,
  },

  isFavorites: {
    type: Boolean,
    default: false,
  },

  status: {
    type: String,
    default: MangaEntryStatus.Reading,
    enum: Object.values(MangaEntryStatus),
  },

  volumesRead: {
    type: Number,
    default: 0,
  },

  chaptersRead: {
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

  manga: {
    type: Schema.Types.ObjectId,
    ref: 'Manga',
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

MangaEntrySchema.index({
  user: 1,
  manga: 1,
}, { unique: true });


MangaEntrySchema.plugin(MongooseMultiLanguage, {
  fields: [],
});

MangaEntrySchema.plugin(MongooseJsonApi, {
  type: 'manga-entries',
});


export type TMangaEntry = HydratedDocument<IMangaEntry, MangaEntryInstanceMethods, MangaEntryQueryHelper>;

const MangaEntry = model<IMangaEntry, MangaEntryModel>('MangaEntry', MangaEntrySchema);
export default MangaEntry;
