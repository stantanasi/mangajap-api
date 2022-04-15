import { Schema, model, Types } from 'mongoose';
import JsonApiSerializer from "../utils/mongoose-jsonapi/jsonapi-serializer";
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

export const ReviewSchema = new Schema<IReview>({
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


const Review = model<IReview>('Review', ReviewSchema);
export default Review;


JsonApiSerializer.register('reviews', Review);
