import db from "../db";
import { JsonApiId } from "../utils/json-api/json-api-annotations";
import MySqlModel from "../utils/mysql/mysql-model";
import { Entity, PrimaryKey, Column, BelongsTo } from "../utils/mysql/mysql-annotations";
import Anime from "./anime.model";
import Manga from "./manga.model";
import Theme from "./theme.model";

@Entity({
  database: db,
  table: "themerelationships"
})
export default class ThemeRelationships extends MySqlModel {

  @PrimaryKey("themerelationships_id")
  @JsonApiId()
  id?: number;


  @Column("themerelationships_themeid", {
    skipOnUpdate: true,
  })
  themeId?: number;

  @Column("themerelationships_mangaid", {
    skipOnUpdate: true,
  })
  mangaId?: number;

  @Column("themerelationships_animeid", {
    skipOnUpdate: true,
  })
  animeId?: number;


  @BelongsTo("themeId", Theme, "Theme", "id")
  theme?: Theme;

  @BelongsTo("mangaId", Manga, "manga", "id")
  manga?: Manga;

  @BelongsTo("animeId", Anime, "anime", "id")
  anime?: Anime;
}