import db from "../db";
import { JsonApiType, JsonApiId, JsonApiAttribute, JsonApiFilter, JsonApiRelationship } from "../utils/json-api/json-api-annotations";
import MySqlModel from "../utils/mysql/mysql-model";
import { Entity, PrimaryKey, Column, BelongsTo } from "../utils/mysql/mysql-annotations";
import { MySqlColumn } from "../utils/mysql/mysql-column";
import User from "./user.model";
import { Schema, model } from 'mongoose';

@Entity({
  database: db,
  table: "request"
})
@JsonApiType("request")
@JsonApiFilter({
  isDone: (isDone: string) => {
    return {
      where: {
        isDone: isDone,
      }
    }
  },
  userHasRead: (userHasRead: string) => {
    return {
      where: {
        userHasRead: userHasRead,
      }
    }
  }
})
export default class Request extends MySqlModel {

  @PrimaryKey("request_id")
  @JsonApiId()
  id?: number;


  @Column("request_userid", {
    skipOnUpdate: true,
  })
  userId?: number;


  @Column("request_type")
  @JsonApiAttribute()
  requestType?: string;

  @Column("request_data")
  @JsonApiAttribute()
  data?: string;

  @Column("request_isdone", {
    type: MySqlColumn.Boolean
  })
  @JsonApiAttribute()
  isDone?: boolean;

  @Column("request_userhasread", {
    type: MySqlColumn.Boolean
  })
  @JsonApiAttribute()
  userHasRead?: boolean;

  @Column("request_createdat", {
    type: MySqlColumn.DateTime,
    skipOnCreate: true,
    skipOnUpdate: true,
  })
  @JsonApiAttribute()
  createdAt?: Date;

  @Column("request_updatedat", {
    type: MySqlColumn.DateTime,
    skipOnCreate: true,
    skipOnUpdate: true,
  })
  @JsonApiAttribute()
  updatedAt?: Date;


  @BelongsTo("userId", User, "User", "id")
  @JsonApiRelationship()
  user?: User;


  async create(): Promise<this> {
    const model = await super.create()
    await RequestModel.create(model.toMongoModel());
    return model;
  }

  async update(): Promise<this> {
    const model = await super.update()
    await RequestModel.findByIdAndUpdate(model.id, {
      $set: model.toMongoModel(),
    });
    return model;
  }

  async delete(): Promise<number> {
    const result = await super.delete();
    await RequestModel.findByIdAndDelete(this.id);
    return result;
  }

  toMongoModel(): IRequest {
    return {
      _id: this.id!.toString(),

      requestType: this.requestType!,
      data: this.data!,
      isDone: this.isDone!,
      userHasRead: this.userHasRead!,

      user: this.userId!.toString(),

      createdAt: this.createdAt!,
      updatedAt: this.updatedAt!,
    }
  }
}


interface IRequest {
  _id: string;

  requestType: string;
  data: string;
  isDone: boolean;
  userHasRead: boolean;

  user: string;

  createdAt: Date;
  updatedAt: Date;
}

const RequestSchema = new Schema<IRequest>({
  _id: {
    type: String,
    required: true
  },


  requestType: {
    type: String,
    required: true
  },

  data: {
    type: String,
    required: true
  },

  isDone: {
    type: Boolean,
    default: false
  },

  userHasRead: {
    type: Boolean,
    default: false
  },


  user: {
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

export const RequestModel = model<IRequest>('Request', RequestSchema);
