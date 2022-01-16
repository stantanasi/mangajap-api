import { Schema, model, Types, EnforceDocument } from 'mongoose';
import { ref } from 'firebase/storage';
import { storage, uploadFile } from '../firebase-app';
import JsonApiSerializer from "../utils/mongoose-jsonapi/jsonapi-serializer";
import { IManga } from "./manga.model";

export interface IVolume {
  _id: Types.ObjectId;

  titles: {
    [language: string]: string;
  };
  number: number;
  startChapter: number | null;
  endChapter: number | null;
  published: Date | null;
  coverImage: string | null;

  manga: Types.ObjectId & IManga;

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

  startChapter: {
    type: Number,
    default: null
  },

  endChapter: {
    type: Number,
    default: null
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


  manga: {
    type: Schema.Types.ObjectId,
    ref: 'Manga',
    required: true
  },
}, {
  id: false,
  versionKey: false,
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});


VolumeSchema.pre<EnforceDocument<IVolume, {}, {}>>('save', async function () {
  if (this.isModified('coverImage')) {
    this.coverImage = await uploadFile(
      ref(storage, `manga/${this.manga}/volumes/${this._id}/images/cover.jpg`),
      this.coverImage,
    );
  }
});


const Volume = model<IVolume>('Volume', VolumeSchema);
export default Volume;


JsonApiSerializer.register('volumes', Volume);
