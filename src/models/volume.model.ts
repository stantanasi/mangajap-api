import MongooseJsonApi, { JsonApiInstanceMethods, JsonApiModel, JsonApiQueryHelper } from '@stantanasi/mongoose-jsonapi';
import { HydratedDocument, model, Model, Schema, Types } from 'mongoose';
import { deleteFile, uploadFile } from '../firebase-app';
import MongooseChangeTracking, { ChangeTrackingInstanceMethods, ChangeTrackingModel, ChangeTrackingQueryHelper } from '../utils/mongoose-change-tracking/mongoose-change-tracking';
import MongooseMultiLanguage, { MultiLanguageInstanceMethods, MultiLanguageModel, MultiLanguageQueryHelper } from '../utils/mongoose-multi-language/mongoose-multi-language';
import { TChange } from './change.model';
import Chapter, { TChapter } from './chapter.model';
import Manga, { TManga } from './manga.model';
import VolumeEntry, { TVolumeEntry } from './volume-entry.model';

export interface IVolume {
  _id: Types.ObjectId;

  number: number;
  title: Map<string, string>;
  overview: Map<string, string>;
  publishedDate: Map<string, Date | null>;
  cover: Map<string, string | null>;

  chapterCount: number;
  startChapter: number | null;
  endChapter: number | null;
  rating: number | null;

  manga: Types.ObjectId | TManga;
  chapters?: TChapter[];
  changes?: TChange[];
  'volume-entry'?: TVolumeEntry | null;

  createdAt: Date;
  updatedAt: Date;
}

export type VolumeInstanceMethods = MultiLanguageInstanceMethods & JsonApiInstanceMethods & ChangeTrackingInstanceMethods

export type VolumeQueryHelper = MultiLanguageQueryHelper & JsonApiQueryHelper & ChangeTrackingQueryHelper

export type VolumeModel = Model<IVolume, VolumeQueryHelper, VolumeInstanceMethods> & MultiLanguageModel<IVolume> & JsonApiModel<IVolume> & ChangeTrackingModel<IVolume> & {
  updateChapterCount: (_id: Types.ObjectId) => Promise<void>;

  updateStartChapter: (_id: Types.ObjectId) => Promise<void>;

  updateEndChapter: (_id: Types.ObjectId) => Promise<void>;

  updateRating: (_id: Types.ObjectId) => Promise<void>;
}

export const VolumeSchema = new Schema<IVolume, VolumeModel, VolumeInstanceMethods, VolumeQueryHelper, {}, VolumeModel>({
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

  rating: {
    type: Number,
    default: null,
  },


  manga: {
    type: Schema.Types.ObjectId,
    ref: 'Manga',
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

VolumeSchema.virtual('chapters', {
  ref: 'Chapter',
  localField: '_id',
  foreignField: 'volume',
  options: {
    sort: { number: 1 },
  },
});

VolumeSchema.virtual('changes', {
  ref: 'Change',
  localField: '_id',
  foreignField: 'document',
});

VolumeSchema.virtual('volume-entry');

VolumeSchema.index({
  number: 1,
  manga: 1,
}, { unique: true });


VolumeSchema.statics.updateChapterCount = async function (_id) {
  await Volume.findByIdAndUpdate(_id, {
    chapterCount: await Chapter.countDocuments({
      volume: _id,
    }),
  });
};

VolumeSchema.statics.updateStartChapter = async function (_id) {
  await Volume.findByIdAndUpdate(_id, {
    startChapter: await Chapter.findOne({
      volume: _id,
    }).sort({ number: 1 }).then((doc) => doc?.number ?? null),
  });
};

VolumeSchema.statics.updateEndChapter = async function (_id) {
  await Volume.findByIdAndUpdate(_id, {
    endChapter: await Chapter.findOne({
      volume: _id,
    }).sort({ number: -1 }).then((doc) => doc?.number ?? null),
  });
};

VolumeSchema.statics.updateRating = async function (_id) {
  await Volume.findByIdAndUpdate(_id, {
    rating: await VolumeEntry.aggregate()
      .match({ volume: _id })
      .group({
        _id: null,
        rating: { $avg: '$rating' },
      })
      .then((result) => result[0]?.rating ?? null),
  });
};


VolumeSchema.pre<TVolume>('save', async function () {
  if (this.isModified('cover.fr-FR')) {
    this.cover.set('fr-FR', await uploadFile(
      `manga/${this.manga}/volumes/${this._id}/images/cover.jpg`,
      this.cover.get('fr-FR') ?? null,
    ));
  }
});

VolumeSchema.pre<TVolume>('deleteOne', async function () {
  if (this.cover.get('fr-FR')) {
    await deleteFile(
      `manga/${this.manga}/volumes/${this._id}/images/cover.jpg`,
    );
  }
});

VolumeSchema.post('save', async function () {
  await Manga.updateStartDate(this.manga._id);
  await Manga.updateEndDate(this.manga._id);
  await Manga.updateVolumeCount(this.manga._id);
});

VolumeSchema.post('deleteOne', { document: true, query: false }, async function () {
  await Manga.updateStartDate(this.manga._id);
  await Manga.updateEndDate(this.manga._id);
  await Manga.updateVolumeCount(this.manga._id);
});


VolumeSchema.plugin(MongooseMultiLanguage, {
  fields: ['title', 'overview', 'publishedDate', 'cover'],
});

VolumeSchema.plugin(MongooseJsonApi, {
  type: 'volumes',
});

VolumeSchema.plugin(MongooseChangeTracking);


export type TVolume = HydratedDocument<IVolume, VolumeInstanceMethods, VolumeQueryHelper>;

const Volume = model<IVolume, VolumeModel>('Volume', VolumeSchema);
export default Volume;
