import db from "../db";
import { JsonApiAttribute, JsonApiFilter, JsonApiId, JsonApiRelationship, JsonApiType } from "../utils/json-api/json-api-annotations";
import MySqlModel from "../utils/mysql/mysql-model";
import { Entity, PrimaryKey, Column, BelongsTo } from "../utils/mysql/mysql-annotations";
import { MySqlColumn } from "../utils/mysql/mysql-column";
import User from "./user.model";

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