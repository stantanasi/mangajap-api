import db from "../db";
import { JsonApiAttribute, JsonApiId, JsonApiRelationship, JsonApiType } from "../utils/json-api/json-api-annotations";
import MySqlModel from "../utils/mysql/mysql-model";
import { Column, Entity, ManyToMany, PrimaryKey } from "../utils/mysql/mysql-annotations";
import { MySqlColumn } from "../utils/mysql/mysql-column";
import Anime from "./anime.model";
import GenreRelationships from "./genre-relationships.model";
import Manga from "./manga.model";

@Entity({
  database: db,
  table: "genre"
})
@JsonApiType("genres")
export default class Genre extends MySqlModel {

  @PrimaryKey("genre_id")
  @JsonApiId()
  id?: string;


  @Column("genre_title_fr")
  @JsonApiAttribute()
  title?: string;

  @Column("genre_description")
  @JsonApiAttribute()
  description?: string;

  @Column("genre_createdat", {
    type: MySqlColumn.DateTime,
    skipOnCreate: true,
    skipOnUpdate: true,
  })
  @JsonApiAttribute()
  createdAt?: string;

  @Column("genre_updatedat", {
    type: MySqlColumn.DateTime,
    skipOnCreate: true,
    skipOnUpdate: true,
  })
  @JsonApiAttribute()
  updatedAt?: string;


  @ManyToMany("id", GenreRelationships, "GenreRelationships", "genreId", "mangaId", Manga, "Manga", "id")
  @JsonApiRelationship()
  manga?: Manga[];

  @ManyToMany("id", GenreRelationships, "GenreRelationships", "genreId", "animeId", Anime, "Anime", "id")
  @JsonApiRelationship()
  anime?: Anime[];
}