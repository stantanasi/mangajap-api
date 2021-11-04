import db from "../db";
import { JsonApiType, JsonApiId, JsonApiAttribute, JsonApiRelationship } from "../utils/json-api/json-api-annotations";
import MySqlModel from "../utils/mysql/mysql-model";
import { Entity, PrimaryKey, Column, BelongsTo } from "../utils/mysql/mysql-annotations";
import { MySqlColumn } from "../utils/mysql/mysql-column";
import Anime from "./anime.model";
import Season from "./season.model";

@Entity({
  database: db,
  table: "episode"
})
@JsonApiType("episodes")
export default class Episode extends MySqlModel {

  @PrimaryKey("episode_id")
  @JsonApiId()
  id?: number;

  @Column("episode_animeid")
  animeId?: number;

  @Column("episode_seasonid")
  seasonId?: number;


  @Column("episode_title_fr")
  @JsonApiAttribute("titles.fr")
  title_fr?: string;

  @Column("episode_title_en")
  @JsonApiAttribute("titles.en")
  title_en?: string;

  @Column("episode_title_en_jp")
  @JsonApiAttribute("titles.en_jp")
  title_en_jp?: string;

  @Column("episode_title_ja_jp")
  @JsonApiAttribute("titles.ja_jp")
  title_ja_jp?: string;

  @Column("episode_relativenumber")
  @JsonApiAttribute()
  relativeNumber?: number;

  @Column("episode_number")
  @JsonApiAttribute()
  number?: number;

  @Column("episode_airdate", {
    type: MySqlColumn.Date
  })
  @JsonApiAttribute()
  airDate?: Date;

  @Column("episode_type")
  @JsonApiAttribute()
  episodeType?: string;

  @Column("episode_createdat", {
    type: MySqlColumn.DateTime,
    skipOnCreate: true,
    skipOnUpdate: true,
  })
  @JsonApiAttribute()
  createdAt?: Date;

  @Column("episode_updatedat", {
    type: MySqlColumn.DateTime,
    skipOnCreate: true,
    skipOnUpdate: true,
  })
  @JsonApiAttribute()
  updatedAt?: Date;


  @BelongsTo("animeId", Anime, "Anime", "id")
  @JsonApiRelationship()
  anime?: Anime;

  @BelongsTo("seasonId", Season, "Season", "id")
  @JsonApiRelationship()
  season?: Season;
}