import MongooseJsonApi, { JsonApiInstanceMethods, JsonApiModel, JsonApiQueryHelper } from '@stantanasi/mongoose-jsonapi';
import { HydratedDocument, model, Model, Schema, Types } from 'mongoose';
import { deleteFile, uploadFile } from '../firebase-app';
import MongooseChangeTracking, { ChangeTrackingInstanceMethods, ChangeTrackingModel, ChangeTrackingQueryHelper } from '../utils/mongoose-change-tracking/mongoose-change-tracking';
import MongooseMultiLanguage, { MultiLanguageInstanceMethods, MultiLanguageModel, MultiLanguageQueryHelper } from '../utils/mongoose-multi-language/mongoose-multi-language';
import { TChange } from './change.model';
import { TChapterEntry } from './chapter-entry.model';
import { TManga } from './manga.model';
import { TVolume } from './volume.model';

export interface IChapter {
  _id: Types.ObjectId;

  number: number;
  title: Map<string, string>;
  overview: Map<string, string>;
  publishedDate: Map<string, Date | null>;
  cover: Map<string, string | null>;

  manga: Types.ObjectId | TManga;
  volume: Types.ObjectId | TVolume | null;
  changes?: TChange[];
  'chapter-entry'?: TChapterEntry | null;

  createdAt: Date;
  updatedAt: Date;
}

export type ChapterInstanceMethods = MultiLanguageInstanceMethods & JsonApiInstanceMethods & ChangeTrackingInstanceMethods

export type ChapterQueryHelper = MultiLanguageQueryHelper & JsonApiQueryHelper & ChangeTrackingQueryHelper

export type ChapterModel = Model<IChapter, ChapterQueryHelper, ChapterInstanceMethods> & MultiLanguageModel<IChapter> & JsonApiModel<IChapter> & ChangeTrackingModel<IChapter>

export const ChapterSchema = new Schema<IChapter, ChapterModel, ChapterInstanceMethods, ChapterQueryHelper>({
  number: {
    type: Number,
    required: true,
  },

  title: {
    type: Map,
    of: String,
    default: {},
  },

  overview: {
    type: Map,
    of: String,
    default: {},
  },

  publishedDate: {
    type: Map,
    of: Date,
    default: {},
    transform: function (this, val: IChapter['publishedDate']) {
      return Object.fromEntries(
        Array.from(val.entries()).map(([key, value]) => [key, value?.toISOString().slice(0, 10) ?? null])
      );
    },
  },

  cover: {
    type: Map,
    of: String,
    default: {},
  },


  manga: {
    type: Schema.Types.ObjectId,
    ref: 'Manga',
    required: true,
  },

  volume: {
    type: Schema.Types.ObjectId,
    ref: 'Volume',
    default: null,
  },
}, {
  id: false,
  versionKey: false,
  timestamps: true,
  minimize: false,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

ChapterSchema.virtual('changes', {
  ref: 'Change',
  localField: '_id',
  foreignField: 'document',
});

ChapterSchema.virtual('chapter-entry');

ChapterSchema.index({
  number: 1,
  manga: 1,
}, { unique: true });


ChapterSchema.pre<TChapter>('save', async function () {
  if (this.isModified('cover.fr-FR')) {
    this.cover.set('fr-FR', await uploadFile(
      `manga/${this.manga}/volumes/${this._id}/images/cover.jpg`,
      this.cover.get('fr-FR') ?? null,
    ));
  }
});

ChapterSchema.pre<TChapter>('deleteOne', async function () {
  if (this.cover.get('fr-FR')) {
    await deleteFile(
      `manga/${this.manga}/volumes/${this._id}/images/cover.jpg`,
    );
  }
});


ChapterSchema.plugin(MongooseMultiLanguage, {
  fields: ['title', 'overview', 'publishedDate', 'cover'],
});

ChapterSchema.plugin(MongooseJsonApi, {
  type: 'chapters',
});

ChapterSchema.plugin(MongooseChangeTracking);


export type TChapter = HydratedDocument<IChapter, ChapterInstanceMethods, ChapterQueryHelper>;

const Chapter = model<IChapter, ChapterModel>('Chapter', ChapterSchema);
export default Chapter;
