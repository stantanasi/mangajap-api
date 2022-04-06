import { Schema, model, Types } from 'mongoose';
import JsonApiSerializer from "../utils/mongoose-jsonapi/jsonapi-serializer";
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

export const RequestSchema = new Schema<IRequest>({
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


const Request = model<IRequest>('Request', RequestSchema);
export default Request;


JsonApiSerializer.register('requests', Request);
