import { Schema, model, Types, EnforceDocument } from 'mongoose';
import { ref } from 'firebase/storage';
import { storage, uploadFile } from '../firebase-app';
import JsonApiSerializer from "../utils/mongoose-jsonapi/jsonapi-serializer";
import { IManga } from "./manga.model";
import Chapter, { IChapter } from './chapter.model';

export interface IVolume {
  _id: Types.ObjectId;

  titles: {
    [language: string]: string;
  };
  number: number;
  published: Date | null;
  coverImage: string | null;
  
  chapterCount: number;
  startChapter: number | null;
  endChapter: number | null;

  manga: Types.ObjectId & IManga;
  chapters?: IChapter[];

  createdAt: Date;
  updatedAt: Date;
}

export const VolumeSchema = new Schema<IVolume>({
  titles: {
    type: Schema.Types.Mixed,
    default: {}
  },

  number: {
    type: Number,
    required: true
  },

  published: {
    type: Date,
    default: null,
    transform: function (this, val) {
      return val?.toISOString().slice(0, 10) ?? null;
    },
  },

  coverImage: {
    type: String,
    default: null,
  },
  

  chapterCount: {
    type: Number,
    default: 0,
  },

  startChapter: {
    type: Number,
    default: null
  },

  endChapter: {
    type: Number,
    default: null
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

VolumeSchema.virtual('chapters', {
  ref: 'Chapter',
  localField: '_id',
  foreignField: 'volume',
  options: {
    sort: { number: 1 },
  },
});

VolumeSchema.index({
  number: 1,
  manga: 1
}, { unique: true });


VolumeSchema.pre<EnforceDocument<IVolume, {}, {}>>('save', async function () {
  if (this.isModified('coverImage')) {
    this.coverImage = await uploadFile(
      ref(storage, `manga/${this.manga}/volumes/${this._id}/images/cover.jpg`),
      this.coverImage,
    );
  }
});

VolumeSchema.pre('findOne', async function () {
  const _id = this.getQuery()._id;
  if (!_id) return;

  await Volume.findOneAndUpdate(this.getQuery(), {
    chapterCount: await Chapter.count({
      volume: _id,
    }),

    startChapter: (await Chapter.findOne({
      volume: _id,
    }).sort({ number: 1 }))?.number ?? null,

    endChapter: (await Chapter.findOne({
      volume: _id,
    }).sort({ number: -1 }))?.number ?? null,
  });
});


const Volume = model<IVolume>('Volume', VolumeSchema);
export default Volume;


JsonApiSerializer.register('volumes', Volume);
