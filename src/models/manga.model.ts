import slugify from "slugify";
import db from "../db";
import { JsonApiAttribute, JsonApiFilter, JsonApiId, JsonApiRelationship, JsonApiType } from "../utils/json-api/json-api-annotations";
import MySqlModel from "../utils/mysql/mysql-model";
import { Column, Entity, ManyToMany, OneToMany, OneToOne, PrimaryKey } from "../utils/mysql/mysql-annotations";
import { MySqlColumn } from "../utils/mysql/mysql-column";
import GenreRelationships from "./genre-relationships.model";
import Genre from "./genre.model";
import Volume from "./volume.model";
import Theme from "./theme.model";
import Staff from "./staff.model";
import Franchise from "./franchise.model";
import Review from "./review.model";
import ThemeRelationships from "./theme-relationships.model";
import MangaEntry from "./manga-entry.model";
import User from "./user.model";
import { getDownloadURL, ref, uploadString, deleteObject } from '@firebase/storage';
import { storage } from '../firebase-app';

@Entity({
  database: db,
  table: "manga"
})
@JsonApiType("manga")
@JsonApiFilter({
  query: (query: string) => {
    return {
      where: {
        or: {
          title: `%${query.replace("'", "''")}%`,
          title_fr: `%${query.replace("'", "''")}%`,
          title_en: `%${query.replace("'", "''")}%`,
          title_en_jp: `%${query.replace("'", "''")}%`,
          title_ja_jp: `%${query.replace("'", "''")}%`,
        },
      },
      order: [
        `CASE
          WHEN manga_title LIKE '${query.replace("'", "''")}%' THEN 0
          WHEN manga_title_fr LIKE '${query.replace("'", "''")}%' THEN 1
          WHEN manga_title_en LIKE '${query.replace("'", "''")}%' THEN 2
          WHEN manga_title_en_jp LIKE '${query.replace("'", "''")}%' THEN 3
          WHEN manga_title_ja_jp LIKE '${query.replace("'", "''")}%' THEN 4
          ELSE 5
        END`
      ],
    }
  },
})
export default class Manga extends MySqlModel {

  @PrimaryKey("manga_id")
  @JsonApiId()
  id?: number;


  @Column("manga_title")
  @JsonApiAttribute()
  title?: string;

  @Column("manga_title_fr")
  @JsonApiAttribute("titles.fr")
  title_fr?: string;

  @Column("manga_title_en")
  @JsonApiAttribute("titles.en")
  title_en?: string;

  @Column("manga_title_en_jp")
  @JsonApiAttribute("titles.en_jp")
  title_en_jp?: string;

  @Column("manga_title_ja_jp")
  @JsonApiAttribute("titles.ja_jp")
  title_ja_jp?: string;

  @Column("manga_title_kr")
  @JsonApiAttribute("titles.kr")
  title_kr?: string;

  @Column("manga_slug")
  @JsonApiAttribute()
  slug?: string;

  @Column("manga_releasedate", {
    type: MySqlColumn.Date
  })
  @JsonApiAttribute()
  startDate?: Date;

  @Column("manga_enddate", {
    type: MySqlColumn.Date
  })
  @JsonApiAttribute()
  endDate?: Date;

  @Column("manga_origin")
  @JsonApiAttribute()
  origin?: string;

  @Column("manga_status")
  @JsonApiAttribute()
  status?: string;

  @Column("manga_volumecount")
  @JsonApiAttribute()
  volumeCount?: number;

  @Column("manga_chaptercount")
  @JsonApiAttribute()
  chapterCount?: number;

  @Column("manga_type")
  @JsonApiAttribute()
  mangaType?: string;

  @Column("manga_synopsis")
  @JsonApiAttribute()
  synopsis?: string;

  @Column("manga_rating")
  @JsonApiAttribute()
  averageRating?: number;

  @Column("manga_ratingrank")
  @JsonApiAttribute()
  ratingRank?: number;

  @Column("manga_popularity")
  @JsonApiAttribute()
  popularity?: number;

  @Column("manga_usercount")
  @JsonApiAttribute()
  userCount?: number;

  @Column("manga_favoritescount")
  @JsonApiAttribute()
  favoritesCount?: number;

  @Column("manga_reviewcount")
  @JsonApiAttribute()
  reviewCount?: number;

  @Column("manga_createdat", {
    type: MySqlColumn.DateTime,
    skipOnCreate: true,
    skipOnUpdate: true,
  })
  @JsonApiAttribute()
  createdAt?: Date;

  @Column("manga_updatedat", {
    type: MySqlColumn.DateTime,
    skipOnCreate: true,
    skipOnUpdate: true,
  })
  @JsonApiAttribute()
  updatedAt?: Date;


  @OneToMany("id", Volume, "Volume", "mangaId", {
    order: ['number ASC']
  })
  @JsonApiRelationship()
  volumes?: Volume[];

  @ManyToMany("id", GenreRelationships, "GenreRelationships", "mangaId", "genreId", Genre, "Genre", "id")
  @JsonApiRelationship()
  genres?: Genre[];

  @ManyToMany("id", ThemeRelationships, "ThemeRelationships", "mangaId", "themeId", Theme, "Theme", "id")
  @JsonApiRelationship()
  themes?: Theme[];

  @OneToMany("id", Staff, "Staff", "mangaId")
  @JsonApiRelationship()
  staff?: Staff[];

  @OneToMany("id", Review, "Review", "mangaId", {
    order: ['updatedAt DESC']
  })
  @JsonApiRelationship()
  reviews?: Review[];

  @OneToMany("id", Franchise, "Franchise", "sourceId", {
    where: {
      sourceType: 'manga',
    },
  })
  @JsonApiRelationship()
  franchise?: Franchise[];

  @JsonApiRelationship("manga-entry", "MangaEntry")
  mangaEntry?: MangaEntry;


  @JsonApiAttribute()
  get coverImage(): string | null | Promise<string | null> {
    return `https://firebasestorage.googleapis.com/v0/b/mangajap.appspot.com/o/${`manga/${this.id}/images/cover.jpg`.replace(/\//g, '%2F')}?alt=media`
    return (async () => getDownloadURL(ref(storage, `manga/${this.id}/images/cover.jpg`))
      .then(downloadURL => downloadURL)
      .catch(error => null)
    )();
  }
  set coverImage(value: string | null | Promise<string | null>) {
    const storageRef = ref(storage, `manga/${this.id}/images/cover.jpg`);

    if (value === null) {
      deleteObject(storageRef)
        .then()
        .catch();
    } else if (!(value instanceof Promise)) {
      if (value.startsWith('data')) {
        uploadString(storageRef, value, 'data_url')
          .then();
      } else {
        uploadString(storageRef, value, 'base64')
          .then();
      }
    }
  }

  @JsonApiAttribute()
  get bannerImage(): string | Promise<string | null> {
    return `https://firebasestorage.googleapis.com/v0/b/mangajap.appspot.com/o/${`manga/${this.id}/images/banner.jpg`.replace(/\//g, '%2F')}?alt=media`
    return (async () => getDownloadURL(ref(storage, `manga/${this.id}/images/banner.jpg`))
      .then(downloadURL => downloadURL)
      .catch(error => null)
    )();
  }
  set bannerImage(value: string | null | Promise<string | null>) {
    const storageRef = ref(storage, `manga/${this.id}/images/banner.jpg`);

    if (value === null) {
      deleteObject(storageRef)
        .then()
        .catch();
    } else if (!(value instanceof Promise)) {
      if (value.startsWith('data')) {
        uploadString(storageRef, value, 'data_url')
          .then();
      } else {
        uploadString(storageRef, value, 'base64')
          .then();
      }
    }
  }



  async initialize() {
    const selfUser = await User.fromAccessToken();
    if (selfUser) {
      OneToOne("id", MangaEntry, "MangaEntry", "mangaId", {
        where: {
          userId: selfUser?.id || 0,
        }
      })(this, "mangaEntry");
    }
  }

  async beforeCreate() {
    if (!this.slug) {
      this.slug = slugify(this.title || this.title_en || this.title_en_jp || this.title_fr || "");
    }
  }

  async afterFind() {
    db.connection.promise().query(`
        UPDATE
            manga
        SET
            manga_rating = (
                SELECT
                    AVG(mangaentry_rating)
                FROM
                    mangaentry
                WHERE
                    mangaentry_mangaid = manga_id AND mangaentry_rating IS NOT NULL
                GROUP BY
                    mangaentry_mangaid
            ),
            manga_usercount = (
                SELECT
                    COUNT(*)
                FROM
                    mangaentry
                WHERE
                    mangaentry_mangaid = manga_id AND mangaentry_isadd = 1
            ),
            manga_favoritescount = (
                SELECT
                    COUNT(*)
                FROM
                    mangaentry
                WHERE
                    mangaentry_mangaid = manga_id AND mangaentry_isfavorites = 1
            ),
            manga_reviewcount = (
                SELECT
                    COUNT(*)
                FROM
                    review
                WHERE
                    review_mangaid = manga_id
            ),
            manga_popularity = (
                SELECT
                    COALESCE(
                        (manga_usercount + manga_favoritescount) +
                        manga_usercount * COALESCE(manga_rating, 0) +
                        2 * COUNT(mangaentry_id) * COALESCE(manga_rating, 0) *(manga_usercount + manga_favoritescount),
                        0
                    )
                FROM
                    mangaentry
                WHERE
                    mangaentry_mangaid = manga_id AND mangaentry_updatedat BETWEEN(NOW() - INTERVAL 7 DAY) AND NOW()
            )
        WHERE
            manga_id = ${this.id}`)
      .then()
      .catch();
  }
}
