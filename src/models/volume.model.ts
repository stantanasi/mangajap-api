import { Schema, model, Model, Types, Document } from 'mongoose';
import { ref } from 'firebase/storage';
import { storage, uploadFile } from '../firebase-app';
import MongooseJsonApi, { JsonApiInstanceMethods, JsonApiModel, JsonApiQueryHelper } from '../utils/mongoose-jsonapi/mongoose-jsonapi';
import Chapter, { IChapter } from './chapter.model';
import { IManga } from "./manga.model";

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

export interface VolumeInstanceMethods extends Document, JsonApiInstanceMethods {
}

export interface VolumeQueryHelper extends JsonApiQueryHelper {
}

export interface VolumeModel extends Model<IVolume, VolumeQueryHelper, VolumeInstanceMethods> {
}

export const VolumeSchema = new Schema<IVolume, VolumeModel & JsonApiModel<IVolume>, VolumeInstanceMethods, VolumeQueryHelper>({
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
      return val?.toISOString().slice(0, 10) ?? val;
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


VolumeSchema.pre<IVolume & Document>('save', async function () {
  if (this.isModified('coverImage')) {
    this.coverImage = await uploadFile(
      ref(storage, `manga/${this.manga}/volumes/${this._id}/images/cover.jpg`),
      this.coverImage,
    );
  }
});

VolumeSchema.pre('findOne', async function () {
  const _id = this.getFilter()._id;
  if (!_id) return;

  await Volume.findOneAndUpdate(this.getFilter(), {
    chapterCount: await Chapter.count({
      volume: _id,
    }),

    startChapter: await Chapter.findOne({
      volume: _id,
    }).sort({ number: 1 }).then((doc) => doc?.number ?? null),

    endChapter: await Chapter.findOne({
      volume: _id,
    }).sort({ number: -1 }).then((doc) => doc?.number ?? null),
  });
});


VolumeSchema.plugin(MongooseJsonApi, {
  type: 'volumes',
});


const Volume = model<IVolume, VolumeModel & JsonApiModel<IVolume>>('Volume', VolumeSchema);
export default Volume;
