import { Schema, model, Types } from 'mongoose';
import MongooseJsonApi, { JsonApiModel } from '../utils/mongoose-jsonapi/mongoose-jsonapi';
import { IAnime } from "./anime.model";
import { IManga } from "./manga.model";
import { IUser } from "./user.model";

export interface IReview {
  _id: Types.ObjectId;

  content: string;

  user: string & IUser;
  anime?: Types.ObjectId & IAnime;
  manga?: Types.ObjectId & IManga;

  createdAt: Date;
  updatedAt: Date;
}

export interface IReviewModel extends JsonApiModel<IReview> {
}

export const ReviewSchema = new Schema<IReview, IReviewModel>({
  content: {
    type: String,
    required: true
  },


  user: {
    type: String,
    ref: 'User',
    required: true
  },

  anime: {
    type: Schema.Types.ObjectId,
    ref: 'Anime',
    default: undefined
  },

  manga: {
    type: Schema.Types.ObjectId,
    ref: 'Manga',
    default: undefined
  },
}, {
  id: false,
  versionKey: false,
  timestamps: true,
  minimize: false,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});


ReviewSchema.plugin(MongooseJsonApi, {
  type: 'reviews',
});


const Review = model<IReview, IReviewModel>('Review', ReviewSchema);
export default Review;
