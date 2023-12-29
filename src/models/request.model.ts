import { Schema, model, Model, Types } from 'mongoose';
import MongooseJsonApi, { JsonApiInstanceMethods, JsonApiModel, JsonApiQueryHelper } from '../utils/mongoose-jsonapi/mongoose-jsonapi';
import { IUser } from "./user.model";

export interface IRequest {
  _id: Types.ObjectId;

  requestType: string;
  data: string;
  isDone: boolean;
  userHasRead: boolean;

  user: string | IUser;

  createdAt: Date;
  updatedAt: Date;
}

export interface RequestInstanceMethods extends Document, JsonApiInstanceMethods {
}

export interface RequestQueryHelper extends JsonApiQueryHelper {
}

export interface RequestModel extends Model<IRequest, RequestQueryHelper, RequestInstanceMethods> {
}

export const RequestSchema = new Schema<IRequest, RequestModel & JsonApiModel<IRequest>, RequestInstanceMethods, RequestQueryHelper>({
  requestType: {
    type: String,
    required: true
  },

  data: {
    type: String,
    required: true
  },

  isDone: {
    type: Boolean,
    default: false
  },

  userHasRead: {
    type: Boolean,
    default: false
  },


  user: {
    type: String,
    ref: 'User',
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


RequestSchema.plugin(MongooseJsonApi, {
  type: 'requests',
});


const Request = model<IRequest, RequestModel & JsonApiModel<IRequest>>('Request', RequestSchema);
export default Request;
