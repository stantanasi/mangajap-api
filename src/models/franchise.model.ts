import db from "../db";
import { JsonApiType, JsonApiId, JsonApiAttribute, JsonApiRelationship } from "../utils/json-api/json-api-annotations";
import MySqlModel from "../utils/mysql/mysql-model";
import { Entity, PrimaryKey, Column, BelongsTo } from "../utils/mysql/mysql-annotations";
import { MySqlColumn } from "../utils/mysql/mysql-column";
import Anime from "./anime.model";
import Manga from "./manga.model";
import { Schema, model } from 'mongoose';

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


  async create(): Promise<this> {
    const model = await super.create()
    await FranchiseModel.create(model.toMongoModel());
    return model;
  }

  async update(): Promise<this> {
    const model = await super.update()
    await FranchiseModel.findByIdAndUpdate(model.id, {
      $set: model.toMongoModel(),
    });
    return model;
  }

  async delete(): Promise<number> {
    const result = await super.delete();
    await FranchiseModel.findByIdAndDelete(this.id);
    return result;
  }

  toMongoModel(): IFranchise {
    return {
      _id: this.id!.toString(),

      role: this.role! as any,

      source: this.sourceId!.toString(),
      destination: this.destinationId!.toString(),

      sourceModel: this.sourceType === 'anime' ? 'Anime' : 'Manga',
      destinationModel: this.destinationType === 'anime' ? 'Anime' : 'Manga',

      createdAt: this.createdAt!,
      updatedAt: this.updatedAt!,
    }
  }
}


interface IFranchise {
  _id: string;

  role: 'adaptation' | 'alternative_setting' | 'alternative_version' | 'character' | 'full_story' | 'other' | 'parent_story' | 'prequel' | 'sequel' | 'side_story' | 'spinoff' | 'summary';

  source: string;
  destination: string;

  sourceModel: 'Anime' | 'Manga';
  destinationModel: 'Anime' | 'Manga';

  createdAt: Date;
  updatedAt: Date;
}

const FranchiseSchema = new Schema<IFranchise>({
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

export const FranchiseModel = model<IFranchise>('Franchise', FranchiseSchema);
