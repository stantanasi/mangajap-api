import db from "../db";
import MySqlModel from "../utils/mysql/mysql-model";
import { Entity, PrimaryKey, Column, BelongsTo } from "../utils/mysql/mysql-annotations";
import Anime from "./anime.model";
import Genre from "./genre.model";
import Manga from "./manga.model";

@Entity({
  database: db,
  table: "genrerelationships"
})
export default class GenreRelationships extends MySqlModel {

  @PrimaryKey("genrerelationships_id")
  id?: string;


  @Column("genrerelationships_genreid")
  genreId?: string;

  @Column("genrerelationships_mangaid")
  mangaId?: string;

  @Column("genrerelationships_animeid")
  animeId?: string;


  @BelongsTo("genreId", Genre, "Genre", "id")
  genre?: Genre;

  @BelongsTo("mangaId", Manga, "manga", "id")
  manga?: Manga;

  @BelongsTo("animeId", Anime, "anime", "id")
  anime?: Anime;
}