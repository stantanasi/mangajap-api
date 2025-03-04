import MongooseJsonApi, { JsonApiInstanceMethods, JsonApiModel, JsonApiQueryHelper } from "@stantanasi/mongoose-jsonapi";
import { HydratedDocument, model, Model, Schema, Types } from "mongoose";
import MongooseMultiLanguage, { MultiLanguageInstanceMethods, MultiLanguageModel, MultiLanguageQueryHelper } from "../utils/mongoose-multi-language/mongoose-multi-language";
import { TUser } from "./user.model";

export interface IRequest {
  _id: Types.ObjectId;

  requestType: string;
  data: string;
  isDone: boolean;
  userHasRead: boolean;

  user: string | TUser;

  createdAt: Date;
  updatedAt: Date;
}

export type RequestInstanceMethods = MultiLanguageInstanceMethods & JsonApiInstanceMethods

export type RequestQueryHelper = MultiLanguageQueryHelper & JsonApiQueryHelper

export type RequestModel = Model<IRequest, RequestQueryHelper, RequestInstanceMethods> & MultiLanguageModel<IRequest> & JsonApiModel<IRequest>

export const RequestSchema = new Schema<IRequest, RequestModel, RequestInstanceMethods, RequestQueryHelper>({
  requestType: {
    type: String,
    required: true,
  },

  data: {
    type: String,
    required: true,
  },

  isDone: {
    type: Boolean,
    default: false,
  },

  userHasRead: {
    type: Boolean,
    default: false,
  },


  user: {
    type: String,
    ref: "User",
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


RequestSchema.plugin(MongooseMultiLanguage, {
  fields: [],
});

RequestSchema.plugin(MongooseJsonApi, {
  type: "requests",
});


export type TRequest = HydratedDocument<IRequest, RequestInstanceMethods, RequestQueryHelper>;

const Request = model<IRequest, RequestModel>("Request", RequestSchema);
export default Request;
