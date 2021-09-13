import db from "../db";
import { JsonApiType, JsonApiId, JsonApiAttribute, JsonApiRelationship } from "../utils/json-api/json-api-annotations";
import MySqlModel from "../utils/mysql/mysql-model";
import { Entity, PrimaryKey, Column, ManyToMany } from "../utils/mysql/mysql-annotations";
import { MySqlColumn } from "../utils/mysql/mysql-column";
import Anime from "./anime.model";
import Manga from "./manga.model";
import ThemeRelationships from "./theme-relationships.model";

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
  createdAt?: string;

  @Column("theme_updatedat", {
    type: MySqlColumn.DateTime,
    skipOnCreate: true,
    skipOnUpdate: true,
  })
  @JsonApiAttribute()
  updatedAt?: string;


  @ManyToMany("id", ThemeRelationships, "ThemeRelationships", "themeId", "mangaId", Manga, "Manga", "id")
  @JsonApiRelationship()
  manga?: Manga[];

  @ManyToMany("id", ThemeRelationships, "ThemeRelationships", "themeId", "animeId", Anime, "Anime", "id")
  @JsonApiRelationship()
  anime?: Anime[];
}