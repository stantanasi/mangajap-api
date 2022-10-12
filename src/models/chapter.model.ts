import { Schema, model, Model, Types } from 'mongoose';
import MongooseJsonApi, { JsonApiInstanceMethods, JsonApiModel, JsonApiQueryHelper } from '../utils/mongoose-jsonapi/mongoose-jsonapi';
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

export interface ChapterInstanceMethods extends Document, JsonApiInstanceMethods {
}

export interface ChapterQueryHelper extends JsonApiQueryHelper {
}

export interface ChapterModel extends Model<IChapter, ChapterQueryHelper, ChapterInstanceMethods> {
}

export const ChapterSchema = new Schema<IChapter, ChapterModel & JsonApiModel<IChapter>, ChapterInstanceMethods, ChapterQueryHelper>({
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


const Chapter = model<IChapter, ChapterModel & JsonApiModel<IChapter>>('Chapter', ChapterSchema);
export default Chapter;
