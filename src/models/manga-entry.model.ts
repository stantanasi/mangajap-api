import { HydratedDocument, model, Model, Schema, Types } from 'mongoose';
import MongooseJsonApi, { JsonApiInstanceMethods, JsonApiModel, JsonApiQueryHelper } from '../utils/mongoose-jsonapi/mongoose-jsonapi';
import { TManga } from "./manga.model";
import { TUser } from "./user.model";

export interface IMangaEntry {
  _id: Types.ObjectId;

  isAdd: boolean;
  isFavorites: boolean;
  status: 'reading' | 'completed' | 'planned' | 'on_hold' | 'dropped';
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

export interface MangaEntryInstanceMethods extends JsonApiInstanceMethods {
}

export interface MangaEntryQueryHelper extends JsonApiQueryHelper {
}

export interface MangaEntryModel extends Model<IMangaEntry, MangaEntryQueryHelper, MangaEntryInstanceMethods> {
}

export const MangaEntrySchema = new Schema<IMangaEntry, MangaEntryModel & JsonApiModel<IMangaEntry>, MangaEntryInstanceMethods, MangaEntryQueryHelper>({
  isAdd: {
    type: Boolean,
    default: false
  },

  isFavorites: {
    type: Boolean,
    default: false
  },

  status: {
    type: String,
    default: 'reading',
    enum: ['reading', 'completed', 'planned', 'on_hold', 'dropped']
  },

  volumesRead: {
    type: Number,
    default: 0
  },

  chaptersRead: {
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
  manga: 1
}, { unique: true });


MangaEntrySchema.plugin(MongooseJsonApi, {
  type: 'manga-entries',
});


export type TMangaEntry = HydratedDocument<IMangaEntry, MangaEntryInstanceMethods, MangaEntryQueryHelper>

const MangaEntry = model<IMangaEntry, MangaEntryModel & JsonApiModel<IMangaEntry>>('MangaEntry', MangaEntrySchema);
export default MangaEntry;
