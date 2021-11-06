import db from "../db";
import { JsonApiId, JsonApiAttribute, JsonApiType, JsonApiRelationship } from "../utils/json-api/json-api-annotations";
import MySqlModel from "../utils/mysql/mysql-model";
import { Entity, PrimaryKey, Column, BelongsTo } from "../utils/mysql/mysql-annotations";
import { MySqlColumn } from "../utils/mysql/mysql-column";
import Manga from "./manga.model";
import { getDownloadURL, ref, uploadString, deleteObject } from '@firebase/storage';
import { storage } from '../firebase-app';

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


  @JsonApiAttribute()
  get coverImage(): string | null | Promise<string | null> {
    return `https://firebasestorage.googleapis.com/v0/b/mangajap.appspot.com/o/${`manga/${this.mangaId}/volumes/${this.id}/images/cover.jpg`.replace(/\//g, '%2F')}?alt=media`
    return (async () => getDownloadURL(ref(storage, `manga/${this.mangaId}/volumes/${this.id}/images/cover.jpg`))
      .then(downloadURL => downloadURL)
      .catch(error => null)
    )();
  }
  set coverImage(value: string | null | Promise<string | null>) {
    if (!this.mangaId) {
      Volume.findById(`${this.id}`).then(volume => {
        if (volume) {
          this.mangaId = volume.mangaId;
          this.coverImage = value;
        }
      });

    } else {
      const storageRef = ref(storage, `manga/${this.mangaId}/volumes/${this.id}/images/cover.jpg`);

      if (value === null) {
        deleteObject(storageRef)
          .then()
          .catch();
      } else if (typeof value === 'string') {
        value = value.replace(/(\r\n|\n|\r)/gm, '')
        if (value.startsWith('data')) {
          uploadString(storageRef, value, 'data_url')
            .then();
        } else {
          uploadString(storageRef, value, 'base64')
            .then();
        }
      }
    }
  }
}