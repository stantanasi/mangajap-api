import db from "../db";
import { JsonApiType, JsonApiId, JsonApiAttribute, JsonApiRelationship } from "../utils/json-api/json-api-annotations";
import MySqlModel from "../utils/mysql/mysql-model";
import { Entity, PrimaryKey, Column, BelongsTo } from "../utils/mysql/mysql-annotations";
import { MySqlColumn } from "../utils/mysql/mysql-column";
import Anime, { IAnime } from "./anime.model";
import Manga, { IManga } from "./manga.model";
import People, { IPeople } from "./people.model";
import { Schema, model } from 'mongoose';
import JsonApiSerializer from "../utils/mongoose-jsonapi/jsonapi-serializer";

@Entity({
  database: db,
  table: "staff"
})
@JsonApiType("staff")
export default class Staff extends MySqlModel {

  @PrimaryKey("staff_id")
  @JsonApiId()
  id?: number;


  @Column("staff_peopleid", {
    skipOnUpdate: true,
  })
  peopleId?: number;

  @Column("staff_mangaid", {
    skipOnUpdate: true,
  })
  mangaId?: number;

  @Column("staff_animeid", {
    skipOnUpdate: true,
  })
  animeId?: number;


  @Column("staff_role")
  @JsonApiAttribute()
  role?: string;

  @Column("staff_createdat", {
    type: MySqlColumn.DateTime,
    skipOnCreate: true,
    skipOnUpdate: true,
  })
  @JsonApiAttribute()
  createdAt?: Date;

  @Column("staff_updatedat", {
    type: MySqlColumn.DateTime,
    skipOnCreate: true,
    skipOnUpdate: true,
  })
  @JsonApiAttribute()
  updatedAt?: Date;


  @BelongsTo("peopleId", People, "People", "id")
  @JsonApiRelationship()
  people?: People;

  @BelongsTo("mangaId", Manga, "Manga", "id")
  @JsonApiRelationship()
  manga?: Manga;

  @BelongsTo("animeId", Anime, "Anime", "id")
  @JsonApiRelationship()
  anime?: Anime;
}


export interface IStaff {
  _id: string;

  role: 'author' | 'illustrator' | 'story_and_art' | 'licensor' | 'producer' | 'studio' | 'original_creator';

  people: string & IPeople;
  anime?: string & IAnime;
  manga?: string & IManga;

  createdAt: Date;
  updatedAt: Date;
}

export const StaffSchema = new Schema<IStaff>({
  _id: {
    type: String,
    required: true
  },


  role: {
    type: String,
    required: true,
    enum: ['author', 'illustrator', 'story_and_art', 'licensor', 'producer', 'studio', 'original_creator']
  },


  people: {
    type: String,
    ref: 'People',
    required: true
  },

  anime: {
    type: String,
    ref: 'Anime',
    default: undefined
  },

  manga: {
    type: String,
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


export const StaffModel = model<IStaff>('Staff', StaffSchema);


JsonApiSerializer.register('staff', StaffModel);
