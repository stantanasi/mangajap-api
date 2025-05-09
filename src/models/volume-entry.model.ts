import MongooseJsonApi, { JsonApiInstanceMethods, JsonApiModel, JsonApiQueryHelper } from '@stantanasi/mongoose-jsonapi';
import { HydratedDocument, model, Model, Schema, Types } from 'mongoose';
import MongooseMultiLanguage, { MultiLanguageInstanceMethods, MultiLanguageModel, MultiLanguageQueryHelper } from '../utils/mongoose-multi-language/mongoose-multi-language';
import { TUser } from './user.model';
import { TVolume } from './volume.model';

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

export const VolumeEntrySchema = new Schema<IVolumeEntry, VolumeEntryModel, VolumeEntryInstanceMethods, VolumeEntryQueryHelper>({
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


VolumeEntrySchema.plugin(MongooseMultiLanguage, {
  fields: [],
});

VolumeEntrySchema.plugin(MongooseJsonApi, {
  type: 'volume-entries',
});


export type TVolumeEntry = HydratedDocument<IVolumeEntry, VolumeEntryInstanceMethods, VolumeEntryQueryHelper>;

const VolumeEntry = model<IVolumeEntry, VolumeEntryModel>('VolumeEntry', VolumeEntrySchema);
export default VolumeEntry;
