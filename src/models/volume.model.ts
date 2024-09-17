import MongooseJsonApi, { JsonApiInstanceMethods, JsonApiModel, JsonApiQueryHelper } from "@stantanasi/mongoose-jsonapi";
import { HydratedDocument, model, Model, Schema, Types } from "mongoose";
import { deleteFile, uploadFile } from "../firebase-app";
import Chapter, { TChapter } from "./chapter.model";
import { TManga } from "./manga.model";
import { TVolumeEntry } from "./volume-entry.model";

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

  manga: Types.ObjectId | TManga;
  chapters?: TChapter[];
  "volume-entry"?: TVolumeEntry | null;

  createdAt: Date;
  updatedAt: Date;
}

export type VolumeInstanceMethods = JsonApiInstanceMethods

export type VolumeQueryHelper = JsonApiQueryHelper

export type VolumeModel = Model<IVolume, VolumeQueryHelper, VolumeInstanceMethods> & JsonApiModel<IVolume>

export const VolumeSchema = new Schema<IVolume, VolumeModel, VolumeInstanceMethods, VolumeQueryHelper>({
  titles: {
    type: Schema.Types.Mixed,
    default: {},
  },

  number: {
    type: Number,
    required: true,
  },

  published: {
    type: Date,
    default: null,
    transform: function (this, val: Date | null | undefined) {
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
    default: null,
  },

  endChapter: {
    type: Number,
    default: null,
  },


  manga: {
    type: Schema.Types.ObjectId,
    ref: "Manga",
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

VolumeSchema.virtual("chapters", {
  ref: "Chapter",
  localField: "_id",
  foreignField: "volume",
  options: {
    sort: { number: 1 },
  },
});

VolumeSchema.virtual("volume-entry");

VolumeSchema.index({
  number: 1,
  manga: 1,
}, { unique: true });


VolumeSchema.pre<TVolume>("save", async function () {
  if (this.isModified("coverImage")) {
    this.coverImage = await uploadFile(
      `manga/${this.manga}/volumes/${this._id}/images/cover.jpg`,
      this.coverImage,
    );
  }
});

VolumeSchema.pre("findOne", async function () {
  const _id = this.getFilter()._id;
  if (!_id) return;

  await Volume.findOneAndUpdate(this.getFilter(), {
    chapterCount: await Chapter.countDocuments({
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

VolumeSchema.pre<TVolume>("deleteOne", async function () {
  if (this.coverImage) {
    await deleteFile(
      `manga/${this.manga}/volumes/${this._id}/images/cover.jpg`,
    );
  }
});


VolumeSchema.plugin(MongooseJsonApi, {
  type: "volumes",
});


export type TVolume = HydratedDocument<IVolume, VolumeInstanceMethods, VolumeQueryHelper>;

const Volume = model<IVolume, VolumeModel>("Volume", VolumeSchema);
export default Volume;
