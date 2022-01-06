import { Schema, model, Types } from 'mongoose';
import JsonApiSerializer from "../utils/mongoose-jsonapi/jsonapi-serializer";
import { IUser } from "./user.model";

export interface IRequest {
  _id: Types.ObjectId;

  requestType: string;
  data: string;
  isDone: boolean;
  userHasRead: boolean;

  user: Types.ObjectId & IUser;

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
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
}, {
  id: false,
  versionKey: false,
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});


const Request = model<IRequest>('Request', RequestSchema);
export default Request;


JsonApiSerializer.register('requests', Request);
