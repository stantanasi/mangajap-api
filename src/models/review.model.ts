import db from "../db";
import { JsonApiId, JsonApiAttribute, JsonApiType, JsonApiRelationship } from "../utils/json-api/json-api-annotations";
import MySqlModel from "../utils/mysql/mysql-model";
import { PrimaryKey, Column, BelongsTo, Entity } from "../utils/mysql/mysql-annotations";
import { MySqlColumn } from "../utils/mysql/mysql-column";
import Anime from "./anime.model";
import Manga from "./manga.model";
import User from "./user.model";
import { Schema, model } from 'mongoose';

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
  _id: string;

  content: string;

  user: string;
  manga?: string;
  anime?: string;

  createdAt: Date;
  updatedAt: Date;
}

export const ReviewSchema = new Schema<IReview>({
  _id: {
    type: String,
    required: true
  },


  content: {
    type: String,
    required: true
  },


  user: {
    type: String,
    ref: 'User',
    required: true
  },

  manga: {
    type: String,
    ref: 'Manga',
    default: undefined
  },

  anime: {
    type: String,
    ref: 'Anime',
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
