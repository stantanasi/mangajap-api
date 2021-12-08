import db from "../db";
import { JsonApiType, JsonApiId, JsonApiAttribute, JsonApiRelationship } from "../utils/json-api/json-api-annotations";
import MySqlModel from "../utils/mysql/mysql-model";
import { Entity, PrimaryKey, Column, BelongsTo } from "../utils/mysql/mysql-annotations";
import { MySqlColumn } from "../utils/mysql/mysql-column";
import Anime from "./anime.model";
import Manga from "./manga.model";
import People from "./people.model";
import { Schema, model } from 'mongoose';

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


  async create(): Promise<this> {
    const model = await super.create()
    await StaffModel.create(model.toMongoModel());
    return model;
  }

  async update(): Promise<this> {
    const model = await super.update()
    await StaffModel.findByIdAndUpdate(model.id, {
      $set: model.toMongoModel(),
    });
    return model;
  }

  async delete(): Promise<number> {
    const result = await super.delete();
    await StaffModel.findByIdAndDelete(this.id);
    return result;
  }

  toMongoModel(): IStaff {
    return {
      _id: this.id!.toString(),

      role: this.role! as any,

      people: this.peopleId!.toString(),
      manga: this.mangaId?.toString() ?? undefined,
      anime: this.animeId?.toString() ?? undefined,

      createdAt: this.createdAt!,
      updatedAt: this.updatedAt!,
    }
  }
}


interface IStaff {
  _id: string;

  role: 'author' | 'illustrator' | 'story_and_art' | 'licensor' | 'producer' | 'studio' | 'original_creator';

  people: string;
  manga?: string;
  anime?: string;

  createdAt: Date;
  updatedAt: Date;
}

const StaffSchema = new Schema<IStaff>({
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

export const StaffModel = model<IStaff>('Staff', StaffSchema);
