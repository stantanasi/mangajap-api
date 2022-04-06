import { model, Schema, Types } from 'mongoose';
import JsonApiSerializer from "../utils/mongoose-jsonapi/jsonapi-serializer";
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

export const ChapterSchema = new Schema<IChapter>({
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


const Chapter = model<IChapter>('Chapter', ChapterSchema);
export default Chapter;


JsonApiSerializer.register('chapters', Chapter);
