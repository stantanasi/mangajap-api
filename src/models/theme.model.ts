import db from "../db";
import { JsonApiType, JsonApiId, JsonApiAttribute, JsonApiRelationship } from "../utils/json-api/json-api-annotations";
import MySqlModel from "../utils/mysql/mysql-model";
import { Entity, PrimaryKey, Column, ManyToMany } from "../utils/mysql/mysql-annotations";
import { MySqlColumn } from "../utils/mysql/mysql-column";
import Anime, { IAnime } from "./anime.model";
import Manga, { IManga } from "./manga.model";
import ThemeRelationships from "./theme-relationships.model";
import { Schema, model } from 'mongoose';
import JsonApiSerializer from "../utils/mongoose-jsonapi/jsonapi-serializer";

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
}


export interface ITheme {
  _id: string;

  title: string;
  description: string;

  animes?: IAnime[];
  mangas?: IManga[];

  createdAt: Date;
  updatedAt: Date;
}

export const ThemeSchema = new Schema<ITheme>({
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
}, {
  id: false,
  versionKey: false,
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
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


JsonApiSerializer.register('themes', ThemeModel);
