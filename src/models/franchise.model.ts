import db from "../db";
import { JsonApiType, JsonApiId, JsonApiAttribute, JsonApiRelationship } from "../utils/json-api/json-api-annotations";
import MySqlModel from "../utils/mysql/mysql-model";
import { Entity, PrimaryKey, Column, BelongsTo } from "../utils/mysql/mysql-annotations";
import { MySqlColumn } from "../utils/mysql/mysql-column";
import Anime from "./anime.model";
import Manga from "./manga.model";
import { Schema, model } from 'mongoose';
import JsonApiSerializer from "../utils/mongoose-jsonapi/jsonapi-serializer";

@Entity({
  database: db,
  table: "franchise"
})
@JsonApiType("franchises")
export default class Franchise extends MySqlModel {

  @PrimaryKey("franchise_id")
  @JsonApiId()
  id?: number;


  @Column("franchise_sourcetype")
  sourceType?: string;

  @Column("franchise_sourceid")
  sourceId?: number;

  @Column("franchise_destinationtype")
  destinationType?: string;

  @Column("franchise_destinationid")
  destinationId?: number;

  @Column("franchise_role")
  @JsonApiAttribute()
  role?: string;

  @Column("franchise_createdat", {
    type: MySqlColumn.DateTime,
    skipOnCreate: true,
    skipOnUpdate: true,
  })
  @JsonApiAttribute()
  createdAt?: Date;

  @Column("franchise_updatedat", {
    type: MySqlColumn.DateTime,
    skipOnCreate: true,
    skipOnUpdate: true,
  })
  @JsonApiAttribute()
  updatedAt?: Date;


  @JsonApiRelationship()
  source?: Anime | Manga;

  @JsonApiRelationship()
  destination?: Anime | Manga;



  async beforeSave() {
    if (this.source instanceof Anime) {
      this.sourceType = 'anime';
      this.sourceId = this.source.id;
    } else if (this.source instanceof Manga) {
      this.sourceType = 'manga';
      this.sourceId = this.source.id;
    }

    if (this.destination instanceof Anime) {
      this.destinationType = 'anime';
      this.destinationId = this.destination.id;
    } else if (this.destination instanceof Manga) {
      this.destinationType = 'manga';
      this.destinationId = this.destination.id;
    }
  }

  async initializeRelations() {
    if (this.sourceType === 'anime') {
      BelongsTo("sourceId", Anime, "Anime", "id")(this, "source");
    } else if (this.sourceType === 'manga') {
      BelongsTo("sourceId", Manga, "Manga", "id")(this, "source");
    }

    if (this.destinationType === 'anime') {
      BelongsTo("destinationId", Anime, "Anime", "id")(this, "destination");
    } else if (this.destinationType === 'manga') {
      BelongsTo("destinationId", Manga, "Manga", "id")(this, "destination");
    }
  }
}


export interface IFranchise {
  _id: string;

  role: 'adaptation' | 'alternative_setting' | 'alternative_version' | 'character' | 'full_story' | 'other' | 'parent_story' | 'prequel' | 'sequel' | 'side_story' | 'spinoff' | 'summary';

  source: string;
  destination: string;

  sourceModel: 'Anime' | 'Manga';
  destinationModel: 'Anime' | 'Manga';

  createdAt: Date;
  updatedAt: Date;
}

export const FranchiseSchema = new Schema<IFranchise>({
  _id: {
    type: String,
    required: true
  },


  role: {
    type: String,
    required: true,
    enum: ['adaptation', 'alternative_setting', 'alternative_version', 'character', 'full_story', 'other', 'parent_story', 'prequel', 'sequel', 'side_story', 'spinoff', 'summary']
  },


  source: {
    type: String,
    refPath: 'sourceModel',
    required: true
  },

  destination: {
    type: String,
    refPath: 'destinationModel',
    required: true
  },


  sourceModel: {
    type: String,
    required: true,
    enum: ['Anime', 'Manga']
  },

  destinationModel: {
    type: String,
    required: true,
    enum: ['Anime', 'Manga']
  },
}, {
  id: false,
  versionKey: false,
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

export const FranchiseModel = model<IFranchise>('Franchise', FranchiseSchema);


JsonApiSerializer.register('franchises', FranchiseModel);
