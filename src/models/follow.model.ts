import db from "../db";
import { JsonApiAttribute, JsonApiFilter, JsonApiId, JsonApiRelationship, JsonApiType } from "../utils/json-api/json-api-annotations";
import MySqlModel from "../utils/mysql/mysql-model";
import { Entity, PrimaryKey, Column, BelongsTo } from "../utils/mysql/mysql-annotations";
import { MySqlColumn } from "../utils/mysql/mysql-column";
import User, { IUser } from "./user.model";
import { Schema, model } from 'mongoose';
import JsonApiSerializer from "../utils/mongoose-jsonapi/jsonapi-serializer";

@Entity({
  database: db,
  table: "follow"
})
@JsonApiType("follows")
@JsonApiFilter({
  followerId: (followerId: string) => {
    return {
      where: {
        followerId: followerId,
      }
    }
  },
  followedId: (followedId: string) => {
    return {
      where: {
        followedId: followedId,
      }
    }
  },
})
export default class Follow extends MySqlModel {

  @PrimaryKey("follow_id")
  @JsonApiId()
  id?: number;


  @Column("follow_followerid", {
    skipOnUpdate: true,
  })
  followerId?: number;

  @Column("follow_followedid", {
    skipOnUpdate: true,
  })
  followedId?: number;


  @Column("follow_createdat", {
    type: MySqlColumn.DateTime,
    skipOnCreate: true,
    skipOnUpdate: true,
  })
  @JsonApiAttribute()
  createdAt?: Date;

  @Column("follow_updatedat", {
    type: MySqlColumn.DateTime,
    skipOnCreate: true,
    skipOnUpdate: true,
  })
  @JsonApiAttribute()
  updatedAt?: Date;



  @BelongsTo("followerId", User, "User", "id")
  @JsonApiRelationship()
  follower?: User;

  @BelongsTo("followedId", User, "User", "id")
  @JsonApiRelationship()
  followed?: User;
}


export interface IFollow {
  _id: string;

  follower: string & IUser;
  followed: string & IUser;

  createdAt: Date;
  updatedAt: Date;
}

export const FollowSchema = new Schema<IFollow>({
  _id: {
    type: String,
    required: true
  },


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
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

FollowSchema.index({
  follower: 1,
  followed: 1
}, { unique: true });


export const FollowModel = model<IFollow>('Follow', FollowSchema);


JsonApiSerializer.register('follows', FollowModel, {
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
