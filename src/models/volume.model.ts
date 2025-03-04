import MongooseJsonApi, { JsonApiInstanceMethods, JsonApiModel, JsonApiQueryHelper } from "@stantanasi/mongoose-jsonapi";
import { HydratedDocument, model, Model, Schema, Types } from "mongoose";
import { deleteFile, uploadFile } from "../firebase-app";
import MongooseMultiLanguage, { MultiLanguageInstanceMethods, MultiLanguageModel, MultiLanguageQueryHelper } from "../utils/mongoose-multi-language/mongoose-multi-language";
import Chapter, { TChapter } from "./chapter.model";
import { TManga } from "./manga.model";
import { TVolumeEntry } from "./volume-entry.model";

export interface IVolume {
  _id: Types.ObjectId;

  number: number;
  title: Map<string, string>;
  overview: Map<string, string>;
  publishedDate: Map<string, Date>;
  cover: Map<string, string | null>;

  chapterCount: number;
  startChapter: number | null;
  endChapter: number | null;

  manga: Types.ObjectId | TManga;
  chapters?: TChapter[];
  "volume-entry"?: TVolumeEntry | null;

  createdAt: Date;
  updatedAt: Date;
}

export type VolumeInstanceMethods = MultiLanguageInstanceMethods & JsonApiInstanceMethods

export type VolumeQueryHelper = MultiLanguageQueryHelper & JsonApiQueryHelper

export type VolumeModel = Model<IVolume, VolumeQueryHelper, VolumeInstanceMethods> & MultiLanguageModel<IVolume> & JsonApiModel<IVolume>

export const VolumeSchema = new Schema<IVolume, VolumeModel, VolumeInstanceMethods, VolumeQueryHelper>({
  number: {
    type: Number,
    required: true,
  },

  title: {
    type: Map,
    of: String,
    default: {},
  },

  overview: {
    type: Map,
    of: String,
    default: {},
  },

  publishedDate: {
    type: Map,
    of: Date,
    default: {},
    transform: function (this, val: IVolume['publishedDate']) {
      return Object.fromEntries(
        Array.from(val.entries()).map(([key, value]) => [key, value?.toISOString().slice(0, 10) ?? null])
      );
    },
  },

  cover: {
    type: Map,
    of: String,
    default: {},
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
  if (this.isModified("cover.fr-FR")) {
    this.cover.set('fr-FR', await uploadFile(
      `manga/${this.manga}/volumes/${this._id}/images/cover.jpg`,
      this.cover.get('fr-FR') ?? null,
    ));
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
  if (this.cover.get('fr-FR')) {
    await deleteFile(
      `manga/${this.manga}/volumes/${this._id}/images/cover.jpg`,
    );
  }
});


VolumeSchema.plugin(MongooseMultiLanguage, {
  fields: ["title", "overview", "publishedDate", "cover"],
});

VolumeSchema.plugin(MongooseJsonApi, {
  type: "volumes",
});


export type TVolume = HydratedDocument<IVolume, VolumeInstanceMethods, VolumeQueryHelper>;

const Volume = model<IVolume, VolumeModel>("Volume", VolumeSchema);
export default Volume;
