import { Schema, model, Model, Types } from 'mongoose';
import MongooseJsonApi, { JsonApiInstanceMethods, JsonApiModel, JsonApiQueryHelper } from '../utils/mongoose-jsonapi/mongoose-jsonapi';
import { IUser } from "./user.model";

export interface IFollow {
  _id: Types.ObjectId;

  follower: string & IUser;
  followed: string & IUser;

  createdAt: Date;
  updatedAt: Date;
}

export interface FollowInstanceMethods extends Document, JsonApiInstanceMethods {
}

export interface FollowQueryHelper extends JsonApiQueryHelper {
}

export interface FollowModel extends Model<IFollow, FollowQueryHelper, FollowInstanceMethods> {
}

export const FollowSchema = new Schema<IFollow, FollowModel & JsonApiModel<IFollow>, FollowInstanceMethods, FollowQueryHelper>({
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


const Follow = model<IFollow, FollowModel & JsonApiModel<IFollow>>('Follow', FollowSchema);
export default Follow;
