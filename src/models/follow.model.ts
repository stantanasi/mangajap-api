import { Schema, model, Document } from 'mongoose';
import JsonApiSerializer from "../utils/mongoose-jsonapi/jsonapi-serializer";
import { IUser } from "./user.model";

export interface IFollow extends Document {
  follower: string & IUser;
  followed: string & IUser;

  createdAt: Date;
  updatedAt: Date;
}

export const FollowSchema = new Schema<IFollow>({
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


const Follow = model<IFollow>('Follow', FollowSchema);
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
