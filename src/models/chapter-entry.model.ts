import MongooseJsonApi, { JsonApiInstanceMethods, JsonApiModel, JsonApiQueryHelper } from '@stantanasi/mongoose-jsonapi';
import { HydratedDocument, model, Model, Schema, Types } from 'mongoose';
import MongooseMultiLanguage, { MultiLanguageInstanceMethods, MultiLanguageModel, MultiLanguageQueryHelper } from '../utils/mongoose-multi-language/mongoose-multi-language';
import Chapter, { TChapter } from './chapter.model';
import MangaEntry from './manga-entry.model';
import User, { TUser } from './user.model';

export interface IChapterEntry {
  _id: Types.ObjectId;

  readDate: Date;
  readCount: number;
  rating: number | null;

  user: string | TUser;
  chapter: Types.ObjectId | TChapter;

  createdAt: Date;
  updatedAt: Date;
}

export type ChapterEntryInstanceMethods = MultiLanguageInstanceMethods & JsonApiInstanceMethods

export type ChapterEntryQueryHelper = MultiLanguageQueryHelper & JsonApiQueryHelper

export type ChapterEntryModel = Model<IChapterEntry, ChapterEntryQueryHelper, ChapterEntryInstanceMethods> & MultiLanguageModel<IChapterEntry> & JsonApiModel<IChapterEntry>

export const ChapterEntrySchema = new Schema<IChapterEntry, ChapterEntryModel, ChapterEntryInstanceMethods, ChapterEntryQueryHelper, {}, ChapterEntryModel>({
  readDate: {
    type: Date,
    default: new Date(),
  },

  readCount: {
    type: Number,
    default: 1,
  },

  rating: {
    type: Number,
    default: null,
  },


  user: {
    type: String,
    ref: 'User',
    required: true,
  },

  chapter: {
    type: Schema.Types.ObjectId,
    ref: 'Chapter',
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

ChapterEntrySchema.index({
  user: 1,
  chapter: 1,
}, { unique: true });


ChapterEntrySchema.post('save', async function () {
  await User.updateChaptersRead(typeof this.user === 'string' ? this.user : this.user._id);

  await Chapter.updateRating(this.chapter._id);

  const chapter = await Chapter.findById(this.chapter._id).select('manga').lean();
  if (!chapter) return

  const mangaEntry = await MangaEntry.findOne({
    user: this.user,
    manga: chapter.manga,
  }).select('_id').lean();
  if (!mangaEntry) return

  await MangaEntry.updateChaptersRead(mangaEntry._id);
});

ChapterEntrySchema.post('deleteOne', { document: true, query: false }, async function () {
  await User.updateChaptersRead(typeof this.user === 'string' ? this.user : this.user._id);

  await Chapter.updateRating(this.chapter._id);

  const chapter = await Chapter.findById(this.chapter._id).select('manga').lean();
  if (!chapter) return

  const mangaEntry = await MangaEntry.findOne({
    user: this.user,
    manga: chapter.manga,
  }).select('_id').lean();
  if (!mangaEntry) return

  await MangaEntry.updateChaptersRead(mangaEntry._id);
});


ChapterEntrySchema.plugin(MongooseMultiLanguage, {
  fields: [],
});

ChapterEntrySchema.plugin(MongooseJsonApi, {
  type: 'chapter-entries',
});


export type TChapterEntry = HydratedDocument<IChapterEntry, ChapterEntryInstanceMethods, ChapterEntryQueryHelper>;

const ChapterEntry = model<IChapterEntry, ChapterEntryModel>('ChapterEntry', ChapterEntrySchema);
export default ChapterEntry;
