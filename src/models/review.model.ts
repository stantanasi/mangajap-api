import MongooseJsonApi, { JsonApiInstanceMethods, JsonApiModel, JsonApiQueryHelper } from "@stantanasi/mongoose-jsonapi";
import { HydratedDocument, model, Model, Schema, Types } from "mongoose";
import { TAnime } from "./anime.model";
import { TManga } from "./manga.model";
import { TUser } from "./user.model";

export interface IReview {
  _id: Types.ObjectId;

  content: string;

  user: string | TUser;
  anime?: Types.ObjectId | TAnime;
  manga?: Types.ObjectId | TManga;

  createdAt: Date;
  updatedAt: Date;
}

export type ReviewInstanceMethods = JsonApiInstanceMethods

export type ReviewQueryHelper = JsonApiQueryHelper

export type ReviewModel = Model<IReview, ReviewQueryHelper, ReviewInstanceMethods> & JsonApiModel<IReview>

export const ReviewSchema = new Schema<IReview, ReviewModel, ReviewInstanceMethods, ReviewQueryHelper>({
  content: {
    type: String,
    required: true,
  },


  user: {
    type: String,
    ref: "User",
    required: true,
  },

  anime: {
    type: Schema.Types.ObjectId,
    ref: "Anime",
    default: undefined,
  },

  manga: {
    type: Schema.Types.ObjectId,
    ref: "Manga",
    default: undefined,
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
  type: "reviews",
});


export type TReview = HydratedDocument<IReview, ReviewInstanceMethods, ReviewQueryHelper>;

const Review = model<IReview, ReviewModel>("Review", ReviewSchema);
export default Review;
