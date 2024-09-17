import MongooseJsonApi, { JsonApiInstanceMethods, JsonApiModel, JsonApiQueryHelper } from "@stantanasi/mongoose-jsonapi";
import { HydratedDocument, model, Model, Schema, Types } from "mongoose";
import { TChapter } from "./chapter.model";
import { TUser } from "./user.model";

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

export type ChapterEntryInstanceMethods = JsonApiInstanceMethods

export type ChapterEntryQueryHelper = JsonApiQueryHelper

export type ChapterEntryModel = Model<IChapterEntry, ChapterEntryQueryHelper, ChapterEntryInstanceMethods> & JsonApiModel<IChapterEntry>

export const ChapterEntrySchema = new Schema<IChapterEntry, ChapterEntryModel, ChapterEntryInstanceMethods, ChapterEntryQueryHelper>({
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
    ref: "User",
    required: true,
  },

  chapter: {
    type: Schema.Types.ObjectId,
    ref: "Chapter",
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


ChapterEntrySchema.plugin(MongooseJsonApi, {
  type: "chapter-entries",
});


export type TChapterEntry = HydratedDocument<IChapterEntry, ChapterEntryInstanceMethods, ChapterEntryQueryHelper>;

const ChapterEntry = model<IChapterEntry, ChapterEntryModel>("ChapterEntry", ChapterEntrySchema);
export default ChapterEntry;
