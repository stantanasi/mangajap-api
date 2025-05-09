import MongooseJsonApi, { JsonApiInstanceMethods, JsonApiModel, JsonApiQueryHelper } from '@stantanasi/mongoose-jsonapi';
import { HydratedDocument, model, Model, Schema, Types } from 'mongoose';
import MongooseMultiLanguage, { MultiLanguageInstanceMethods, MultiLanguageModel, MultiLanguageQueryHelper } from '../utils/mongoose-multi-language/mongoose-multi-language';
import MangaEntry from './manga-entry.model';
import User, { TUser } from './user.model';
import Volume, { TVolume } from './volume.model';

export interface IVolumeEntry {
  _id: Types.ObjectId;

  readDate: Date;
  readCount: number;
  rating: number | null;

  user: string | TUser;
  volume: Types.ObjectId | TVolume;

  createdAt: Date;
  updatedAt: Date;
}

export type VolumeEntryInstanceMethods = MultiLanguageInstanceMethods & JsonApiInstanceMethods

export type VolumeEntryQueryHelper = MultiLanguageQueryHelper & JsonApiQueryHelper

export type VolumeEntryModel = Model<IVolumeEntry, VolumeEntryQueryHelper, VolumeEntryInstanceMethods> & MultiLanguageModel<IVolumeEntry> & JsonApiModel<IVolumeEntry>

export const VolumeEntrySchema = new Schema<IVolumeEntry, VolumeEntryModel, VolumeEntryInstanceMethods, VolumeEntryQueryHelper, {}, VolumeEntryModel>({
  readDate: {
    type: Date,
    default: new Date(),
  },

  readCount: {
    type: Number,
    default: 1,
  },

  rating: {
    type: Number,
    default: null,
  },


  user: {
    type: String,
    ref: 'User',
    required: true,
  },

  volume: {
    type: Schema.Types.ObjectId,
    ref: 'Volume',
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

VolumeEntrySchema.index({
  user: 1,
  volume: 1,
}, { unique: true });


VolumeEntrySchema.post('save', async function () {
  await User.updateVolumesRead(typeof this.user === 'string' ? this.user : this.user._id);

  await Volume.updateRating(this.volume._id);

  const volume = await Volume.findById(this.volume._id).select('manga').lean();
  if (!volume) return

  const mangaEntry = await MangaEntry.findOne({
    user: this.user,
    manga: volume.manga,
  }).select('_id').lean();
  if (!mangaEntry) return

  await MangaEntry.updateVolumesRead(mangaEntry._id);
});

VolumeEntrySchema.post('deleteOne', { document: true, query: false }, async function () {
  await User.updateVolumesRead(typeof this.user === 'string' ? this.user : this.user._id);

  await Volume.updateRating(this.volume._id);

  const volume = await Volume.findById(this.volume._id).select('manga').lean();
  if (!volume) return

  const mangaEntry = await MangaEntry.findOne({
    user: this.user,
    manga: volume.manga,
  }).select('_id').lean();
  if (!mangaEntry) return

  await MangaEntry.updateVolumesRead(mangaEntry._id);
});


VolumeEntrySchema.plugin(MongooseMultiLanguage, {
  fields: [],
});

VolumeEntrySchema.plugin(MongooseJsonApi, {
  type: 'volume-entries',
});


export type TVolumeEntry = HydratedDocument<IVolumeEntry, VolumeEntryInstanceMethods, VolumeEntryQueryHelper>;

const VolumeEntry = model<IVolumeEntry, VolumeEntryModel>('VolumeEntry', VolumeEntrySchema);
export default VolumeEntry;
