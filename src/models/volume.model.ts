import db from "../db";
import { JsonApiId, JsonApiAttribute, JsonApiType, JsonApiRelationship } from "../utils/json-api/json-api-annotations";
import MySqlModel from "../utils/mysql/mysql-model";
import { Entity, PrimaryKey, Column, BelongsTo } from "../utils/mysql/mysql-annotations";
import { MySqlColumn } from "../utils/mysql/mysql-column";
import Manga from "./manga.model";
import fs from "fs";

@Entity({
  database: db,
  table: "volume"
})
@JsonApiType("volumes")
export default class Volume extends MySqlModel {

  @PrimaryKey("volume_id")
  @JsonApiId()
  id?: number;


  @Column("volume_mangaid")
  mangaId?: number;

  
  @Column("volume_title_fr")
  @JsonApiAttribute("titles.fr")
  title_fr?: string;

  @Column("volume_title_en")
  @JsonApiAttribute("titles.en")
  title_en?: string;

  @Column("volume_title_en_jp")
  @JsonApiAttribute("titles.en_jp")
  title_en_jp?: string;

  @Column("volume_title_ja_jp")
  @JsonApiAttribute("titles.ja_jp")
  title_ja_jp?: string;

  @Column("volume_number")
  @JsonApiAttribute()
  number?: number;

  @Column("volume_startchapter")
  @JsonApiAttribute()
  startChapter?: number;

  @Column("volume_endchapter")
  @JsonApiAttribute()
  endChapter?: number;

  @Column("volume_published", {
    type: MySqlColumn.Date
  })
  @JsonApiAttribute()
  published?: Date;

  @Column("volume_createdat", {
    type: MySqlColumn.DateTime,
    skipOnCreate: true,
    skipOnUpdate: true,
  })
  @JsonApiAttribute()
  createdAt?: Date;

  @Column("volume_updatedat", {
    type: MySqlColumn.DateTime,
    skipOnCreate: true,
    skipOnUpdate: true,
  })
  @JsonApiAttribute()
  updatedAt?: Date;


  @BelongsTo("mangaId", Manga, "Manga", "id")
  @JsonApiRelationship()
  manga?: Manga;


  @JsonApiAttribute() // TODO: Structuration des images (manga, anime, users, people, etc)
  get coverImage(): string | null {
    if (fs.existsSync(`./manga/${this.mangaId}/volumes/${this.id}/images/cover.jpg`)) {
      return `http://mangajap.000webhostapp.com/manga/${this.mangaId}/volumes/${this.id}/images/cover.jpg`
    } else {
      return null
    }
  }
  set coverImage(value: string | null) {
    if (value === null) {
      if (fs.existsSync(`./manga/${this.mangaId}/volumes/${this.id}/images/cover.jpg`)) {
        fs.unlinkSync(`./manga/${this.mangaId}/volumes/${this.id}/images/cover.jpg`)
      }
    } else {
      if (value.startsWith('data')) {
        value = value.split(',')[1];
      }

      fs.writeFileSync(`./manga/${this.mangaId}/volumes/${this.id}/images/cover.jpg`, value, {
        encoding: 'base64'
      })
    }
  }
}