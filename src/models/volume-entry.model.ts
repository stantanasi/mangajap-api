import { HydratedDocument, model, Model, Schema, Types } from "mongoose";
import MongooseJsonApi, { JsonApiInstanceMethods, JsonApiModel, JsonApiQueryHelper } from "../utils/mongoose-jsonapi/mongoose-jsonapi";
import { TUser } from "./user.model";
import { TVolume } from "./volume.model";

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

export type VolumeEntryInstanceMethods = JsonApiInstanceMethods

export type VolumeEntryQueryHelper = JsonApiQueryHelper

export type VolumeEntryModel = Model<IVolumeEntry, VolumeEntryQueryHelper, VolumeEntryInstanceMethods> & JsonApiModel<IVolumeEntry>

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
    ref: "User",
    required: true,
  },

  volume: {
    type: Schema.Types.ObjectId,
    ref: "Volume",
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


VolumeEntrySchema.plugin(MongooseJsonApi, {
  type: "volume-entries",
});


export type TVolumeEntry = HydratedDocument<IVolumeEntry, VolumeEntryInstanceMethods, VolumeEntryQueryHelper>;

const VolumeEntry = model<IVolumeEntry, VolumeEntryModel>("VolumeEntry", VolumeEntrySchema);
export default VolumeEntry;
