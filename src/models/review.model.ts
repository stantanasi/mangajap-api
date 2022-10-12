import { Schema, model, Model, Types } from 'mongoose';
import MongooseJsonApi, { JsonApiInstanceMethods, JsonApiModel, JsonApiQueryHelper } from '../utils/mongoose-jsonapi/mongoose-jsonapi';
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

export interface ReviewInstanceMethods extends Document, JsonApiInstanceMethods {
}

export interface ReviewQueryHelper extends JsonApiQueryHelper {
}

export interface ReviewModel extends Model<IReview, ReviewQueryHelper, ReviewInstanceMethods> {
}

export const ReviewSchema = new Schema<IReview, ReviewModel & JsonApiModel<IReview>, ReviewInstanceMethods, ReviewQueryHelper>({
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


const Review = model<IReview, ReviewModel & JsonApiModel<IReview>>('Review', ReviewSchema);
export default Review;
