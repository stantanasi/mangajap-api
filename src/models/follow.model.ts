import { Schema, model, Types } from 'mongoose';
import JsonApiSerializer from "../utils/mongoose-jsonapi/jsonapi-serializer";
import { IUser } from "./user.model";

export interface IFollow {
  _id: Types.ObjectId;

  follower: Types.ObjectId & IUser;
  followed: Types.ObjectId & IUser;

  createdAt: Date;
  updatedAt: Date;
}

export const FollowSchema = new Schema<IFollow>({
  follower: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  followed: {
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

FollowSchema.index({
  follower: 1,
  followed: 1
}, { unique: true });


export const Follow = model<IFollow>('Follow', FollowSchema);


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
