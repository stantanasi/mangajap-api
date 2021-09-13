import db from "../db";
import { JsonApiType, JsonApiId, JsonApiAttribute, JsonApiRelationship } from "../utils/json-api/json-api-annotations";
import MySqlModel from "../utils/mysql/mysql-model";
import { Entity, PrimaryKey, Column, BelongsTo } from "../utils/mysql/mysql-annotations";
import { MySqlColumn } from "../utils/mysql/mysql-column";
import Anime from "./anime.model";
import Manga from "./manga.model";
import People from "./people.model";

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