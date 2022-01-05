import db from "../db";
import { JsonApiId, JsonApiAttribute, JsonApiType, JsonApiRelationship } from "../utils/json-api/json-api-annotations";
import MySqlModel from "../utils/mysql/mysql-model";
import { PrimaryKey, Column, BelongsTo, Entity } from "../utils/mysql/mysql-annotations";
import { MySqlColumn } from "../utils/mysql/mysql-column";
import Anime, { IAnime } from "./anime.model";
import Manga, { IManga } from "./manga.model";
import User, { IUser } from "./user.model";
import { Schema, model, Types } from 'mongoose';
import JsonApiSerializer from "../utils/mongoose-jsonapi/jsonapi-serializer";

@Entity({
  database: db,
  table: "review"
})
@JsonApiType("reviews")
export default class Review extends MySqlModel {

  @PrimaryKey("review_id")
  @JsonApiId()
  id?: number;


  @Column("review_userid", {
    skipOnUpdate: true,
  })
  userId?: number;

  @Column("review_mangaid", {
    skipOnUpdate: true,
  })
  mangaId?: number;

  @Column("review_animeid", {
    skipOnUpdate: true,
  })
  animeId?: number;


  @Column("review_content")
  @JsonApiAttribute()
  content?: string;

  @Column("review_createdat", {
    type: MySqlColumn.DateTime,
    skipOnCreate: true,
    skipOnUpdate: true,
  })
  @JsonApiAttribute()
  createdAt?: Date;

  @Column("review_updatedat", {
    type: MySqlColumn.DateTime,
    skipOnCreate: true,
    skipOnUpdate: true,
  })
  @JsonApiAttribute()
  updatedAt?: Date;


  @BelongsTo("userId", User, "User", "id")
  @JsonApiRelationship()
  user?: User;

  @BelongsTo("mangaId", Manga, "manga", "id")
  @JsonApiRelationship()
  manga?: Manga;

  @BelongsTo("animeId", Anime, "anime", "id")
  @JsonApiRelationship()
  anime?: Anime;
}


export interface IReview {
  _id: Types.ObjectId;

  content: string;

  user: Types.ObjectId & IUser;
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
    type: Schema.Types.ObjectId,
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
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});


export const ReviewModel = model<IReview>('Review', ReviewSchema);


JsonApiSerializer.register('reviews', ReviewModel);
