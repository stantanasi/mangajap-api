import MongooseJsonApi, { JsonApiInstanceMethods, JsonApiModel, JsonApiQueryHelper } from "@stantanasi/mongoose-jsonapi";
import { HydratedDocument, model, Model, Schema, Types } from "mongoose";
import { TChapterEntry } from "./chapter-entry.model";
import { TManga } from "./manga.model";
import { TVolume } from "./volume.model";

export interface IChapter {
  _id: Types.ObjectId;

  titles: {
    [language: string]: string;
  };
  number: number;
  publishedAt: Date | null;

  manga: Types.ObjectId | TManga;
  volume: Types.ObjectId | TVolume | null;
  "chapter-entry"?: TChapterEntry | null;

  createdAt: Date;
  updatedAt: Date;
}

export type ChapterInstanceMethods = JsonApiInstanceMethods

export type ChapterQueryHelper = JsonApiQueryHelper

export type ChapterModel = Model<IChapter, ChapterQueryHelper, ChapterInstanceMethods> & JsonApiModel<IChapter>

export const ChapterSchema = new Schema<IChapter, ChapterModel, ChapterInstanceMethods, ChapterQueryHelper>({
  titles: {
    type: Schema.Types.Mixed,
    default: {},
  },

  number: {
    type: Number,
    required: true,
  },

  publishedAt: {
    type: Date,
    default: null,
    transform: function (this, val: Date | null | undefined) {
      return val?.toISOString().slice(0, 10) ?? val;
    },
  },


  manga: {
    type: Schema.Types.ObjectId,
    ref: "Manga",
    required: true,
  },

  volume: {
    type: Schema.Types.ObjectId,
    ref: "Volume",
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

ChapterSchema.virtual("chapter-entry");

ChapterSchema.index({
  number: 1,
  manga: 1,
}, { unique: true });


ChapterSchema.plugin(MongooseJsonApi, {
  type: "chapters",
});


export type TChapter = HydratedDocument<IChapter, ChapterInstanceMethods, ChapterQueryHelper>;

const Chapter = model<IChapter, ChapterModel>("Chapter", ChapterSchema);
export default Chapter;
