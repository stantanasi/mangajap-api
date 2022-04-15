import { Schema, model, Types } from 'mongoose';
import JsonApiSerializer from "../utils/mongoose-jsonapi/jsonapi-serializer";
import MongooseJsonApi, { JsonApiModel } from '../utils/mongoose-jsonapi/mongoose-jsonapi';
import { IUser } from "./user.model";

export interface IFollow {
  _id: Types.ObjectId;

  follower: string & IUser;
  followed: string & IUser;

  createdAt: Date;
  updatedAt: Date;
}

export interface IFollowModel extends JsonApiModel<IFollow> {
}

export const FollowSchema = new Schema<IFollow, IFollowModel>({
  follower: {
    type: String,
    ref: 'User',
    required: true
  },

  followed: {
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

FollowSchema.index({
  follower: 1,
  followed: 1
}, { unique: true });


FollowSchema.plugin(MongooseJsonApi, {
  type: 'follows',
});


const Follow = model<IFollow, IFollowModel>('Follow', FollowSchema);
export default Follow;


JsonApiSerializer.register('follows', Follow, {
  followerId: (followerId: string) => {
    return {
      follower: followerId,
    };
  },
  followedId: (followedId: string) => {
    return {
      followed: followedId,
    };
  },
});
