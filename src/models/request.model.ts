import { Schema, model, Types } from 'mongoose';
import JsonApiSerializer from "../utils/mongoose-jsonapi/jsonapi-serializer";
import MongooseJsonApi, { JsonApiModel } from '../utils/mongoose-jsonapi/mongoose-jsonapi';
import { IUser } from "./user.model";

export interface IRequest {
  _id: Types.ObjectId;

  requestType: string;
  data: string;
  isDone: boolean;
  userHasRead: boolean;

  user: string & IUser;

  createdAt: Date;
  updatedAt: Date;
}

export interface IRequestModel extends JsonApiModel<IRequest> {
}

export const RequestSchema = new Schema<IRequest, IRequestModel>({
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


const Request = model<IRequest, IRequestModel>('Request', RequestSchema);
export default Request;


JsonApiSerializer.register('requests', Request);
