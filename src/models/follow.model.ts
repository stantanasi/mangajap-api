import db from "../db";
import { JsonApiAttribute, JsonApiFilter, JsonApiId, JsonApiRelationship, JsonApiType } from "../utils/json-api/json-api-annotations";
import MySqlModel from "../utils/mysql/mysql-model";
import { Entity, PrimaryKey, Column, BelongsTo } from "../utils/mysql/mysql-annotations";
import { MySqlColumn } from "../utils/mysql/mysql-column";
import User from "./user.model";
import { Schema, model } from 'mongoose';

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


  async create(): Promise<this> {
    const model = await super.create()
    await FollowModel.create(model.toMongoModel());
    return model;
  }

  async update(): Promise<this> {
    const model = await super.update()
    await FollowModel.findByIdAndUpdate(model.id, {
      $set: model.toMongoModel(),
    });
    return model;
  }

  async delete(): Promise<number> {
    const result = await super.delete();
    await FollowModel.findByIdAndDelete(this.id);
    return result;
  }

  toMongoModel(): IFollow {
    return {
      _id: this.id!.toString(),

      follower: this.followerId!.toString(),
      followed: this.followedId!.toString(),

      createdAt: this.createdAt!,
      updatedAt: this.updatedAt!,
    }
  }
}


interface IFollow {
  _id: string;

  follower: string;
  followed: string;

  createdAt: Date;
  updatedAt: Date;
}

const FollowSchema = new Schema<IFollow>({
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


  createdAt: {
    type: Date,
    default: new Date()
  },

  updatedAt: {
    type: Date,
    default: new Date()
  },
}, {
  id: false,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

FollowSchema.index({
  follower: 1,
  followed: 1
}, { unique: true });

export const FollowModel = model<IFollow>('Follow', FollowSchema);
