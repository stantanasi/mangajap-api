import { Schema, model, Types } from 'mongoose';
import MongooseJsonApi, { JsonApiModel } from '../utils/mongoose-jsonapi/mongoose-jsonapi';
import { IManga } from './manga.model';
import { IVolume } from './volume.model';

export interface IChapter {
  _id: Types.ObjectId;

  titles: {
    [language: string]: string;
  };
  number: number;
  publishedAt: Date | null;

  manga: Types.ObjectId & IManga;
  volume: Types.ObjectId & IVolume | null;

  createdAt: Date;
  updatedAt: Date;
}

export interface IChapterModel extends JsonApiModel<IChapter> {
}

export const ChapterSchema = new Schema<IChapter, IChapterModel>({
  titles: {
    type: Schema.Types.Mixed,
    default: {},
  },

  number: {
    type: Number,
    required: true
  },

  publishedAt: {
    type: Date,
    default: null,
    transform: function (this, val) {
      return val?.toISOString().slice(0, 10) ?? null;
    },
  },


  manga: {
    type: Schema.Types.ObjectId,
    ref: 'Manga',
    required: true
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

ChapterSchema.index({
  number: 1,
  manga: 1
}, { unique: true });


ChapterSchema.plugin(MongooseJsonApi, {
  type: 'chapters',
});


const Chapter = model<IChapter, IChapterModel>('Chapter', ChapterSchema);
export default Chapter;
