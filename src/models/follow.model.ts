import MongooseJsonApi, { JsonApiInstanceMethods, JsonApiModel, JsonApiQueryHelper } from "@stantanasi/mongoose-jsonapi";
import { HydratedDocument, model, Model, Schema, Types } from "mongoose";
import { TUser } from "./user.model";

export interface IFollow {
  _id: Types.ObjectId;

  follower: string | TUser;
  followed: string | TUser;

  createdAt: Date;
  updatedAt: Date;
}

export type FollowInstanceMethods = JsonApiInstanceMethods

export type FollowQueryHelper = JsonApiQueryHelper

export type FollowModel = Model<IFollow, FollowQueryHelper, FollowInstanceMethods> & JsonApiModel<IFollow>

export const FollowSchema = new Schema<IFollow, FollowModel, FollowInstanceMethods, FollowQueryHelper>({
  follower: {
    type: String,
    ref: "User",
    required: true,
  },

  followed: {
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

FollowSchema.index({
  follower: 1,
  followed: 1,
}, { unique: true });


FollowSchema.plugin(MongooseJsonApi, {
  type: "follows",
});


export type TFollow = HydratedDocument<IFollow, FollowInstanceMethods, FollowQueryHelper>;

const Follow = model<IFollow, FollowModel>("Follow", FollowSchema);
export default Follow;
