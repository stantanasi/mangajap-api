import db from "../db";
import { JsonApiType, JsonApiId, JsonApiAttribute, JsonApiRelationship } from "../utils/json-api/json-api-annotations";
import MySqlModel from "../utils/mysql/mysql-model";
import { Entity, PrimaryKey, Column, ManyToMany } from "../utils/mysql/mysql-annotations";
import { MySqlColumn } from "../utils/mysql/mysql-column";
import Anime from "./anime.model";
import Manga from "./manga.model";
import ThemeRelationships from "./theme-relationships.model";
import { Schema, model } from 'mongoose';

@Entity({
  database: db,
  table: "theme"
})
@JsonApiType("themes")
export default class Theme extends MySqlModel {

  @PrimaryKey("theme_id")
  @JsonApiId()
  id?: string;


  @Column("theme_title_fr")
  @JsonApiAttribute()
  title?: string;

  @Column("theme_description")
  @JsonApiAttribute()
  description?: string;

  @Column("theme_createdat", {
    type: MySqlColumn.DateTime,
    skipOnCreate: true,
    skipOnUpdate: true,
  })
  @JsonApiAttribute()
  createdAt?: Date;

  @Column("theme_updatedat", {
    type: MySqlColumn.DateTime,
    skipOnCreate: true,
    skipOnUpdate: true,
  })
  @JsonApiAttribute()
  updatedAt?: Date;


  @ManyToMany("id", ThemeRelationships, "ThemeRelationships", "themeId", "mangaId", Manga, "Manga", "id")
  @JsonApiRelationship()
  manga?: Manga[];

  @ManyToMany("id", ThemeRelationships, "ThemeRelationships", "themeId", "animeId", Anime, "Anime", "id")
  @JsonApiRelationship()
  anime?: Anime[];


  async create(): Promise<this> {
    const model = await super.create()
    await ThemeModel.create(model.toMongoModel());
    return model;
  }

  async update(): Promise<this> {
    const model = await super.update()
    await ThemeModel.findByIdAndUpdate(model.id, {
      $set: model.toMongoModel(),
    });
    return model;
  }

  toMongoModel(): ITheme {
    return {
      _id: this.id!.toString(),

      title: this.title!,
      description: this.description!,

      createdAt: this.createdAt!,
      updatedAt: this.updatedAt!,
    }
  }
}


interface ITheme {
  _id: string;

  title: string;
  description: string;

  createdAt: Date;
  updatedAt: Date;
}

const ThemeSchema = new Schema<ITheme>({
  _id: {
    type: String,
    required: true
  },


  title: {
    type: String,
    required: true
  },

  description: {
    type: String,
    default: '',
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

ThemeSchema.virtual('animes', {
  ref: 'Anime',
  localField: '_id',
  foreignField: 'genres'
});

ThemeSchema.virtual('mangas', {
  ref: 'Manga',
  localField: '_id',
  foreignField: 'genres'
});

export const ThemeModel = model<ITheme>('Theme', ThemeSchema);
