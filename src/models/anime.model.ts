import db from "../db";
import fs from "fs";
import { JsonApiAttribute, JsonApiFilter, JsonApiId, JsonApiRelationship, JsonApiType } from "../utils/json-api/json-api-annotations";
import MySqlModel from "../utils/mysql/mysql-model";
import { Column, Entity, ManyToMany, OneToMany, OneToOne, PrimaryKey } from "../utils/mysql/mysql-annotations";
import { MySqlColumn } from "../utils/mysql/mysql-column";
import Episode from "./episode.model";
import Franchise from "./franchise.model";
import GenreRelationships from "./genre-relationships.model";
import Genre from "./genre.model";
import Review from "./review.model";
import Staff from "./staff.model";
import ThemeRelationships from "./theme-relationships.model";
import Theme from "./theme.model";
import slugify from "slugify";
import AnimeEntry from "./anime-entry.model";
import User from "./user.model";
import Season from "./season.model";

@Entity({
  database: db,
  table: "anime"
})
@JsonApiType("anime")
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
          WHEN anime_title LIKE '${query.replace("'", "''")}%' THEN 0
          WHEN anime_title_fr LIKE '${query.replace("'", "''")}%' THEN 1
          WHEN anime_title_en LIKE '${query.replace("'", "''")}%' THEN 2
          WHEN anime_title_en_jp LIKE '${query.replace("'", "''")}%' THEN 3
          WHEN anime_title_ja_jp LIKE '${query.replace("'", "''")}%' THEN 4
          ELSE 5
        END`,
      ]
    }
  },
})
export default class Anime extends MySqlModel {

  @PrimaryKey("anime_id")
  @JsonApiId()
  id?: number;


  @Column("anime_title")
  @JsonApiAttribute()
  title?: string;

  @Column("anime_title_fr")
  @JsonApiAttribute("titles.fr")
  title_fr?: string;

  @Column("anime_title_en")
  @JsonApiAttribute("titles.en")
  title_en?: string;

  @Column("anime_title_en_jp")
  @JsonApiAttribute("titles.en_jp")
  title_en_jp?: string;

  @Column("anime_title_ja_jp")
  @JsonApiAttribute("titles.ja_jp")
  title_ja_jp?: string;

  @Column("anime_slug")
  @JsonApiAttribute()
  slug?: string;

  @Column("anime_releasedate", {
    type: MySqlColumn.Date
  })
  @JsonApiAttribute()
  startDate?: Date;

  @Column("anime_enddate", {
    type: MySqlColumn.Date
  })
  @JsonApiAttribute()
  endDate?: Date;

  @Column("anime_origin")
  @JsonApiAttribute()
  origin?: string;

  @Column("anime_status")
  @JsonApiAttribute()
  status?: string;

  @Column("anime_seasoncount")
  @JsonApiAttribute()
  seasonCount?: number;

  @Column("anime_episodecount")
  @JsonApiAttribute()
  episodeCount?: number;

  @Column("anime_episodelength")
  @JsonApiAttribute()
  episodeLength?: number;

  @Column("anime_type")
  @JsonApiAttribute()
  animeType?: string;

  @Column("anime_synopsis")
  @JsonApiAttribute()
  synopsis?: string;

  @Column("anime_rating")
  @JsonApiAttribute()
  averageRating?: number;

  @Column("anime_ratingrank")
  @JsonApiAttribute()
  ratingRank?: number;

  @Column("anime_popularity")
  @JsonApiAttribute()
  popularity?: number;

  @Column("anime_usercount")
  @JsonApiAttribute()
  userCount?: number;

  @Column("anime_favoritescount")
  @JsonApiAttribute()
  favoritesCount?: number;

  @Column("anime_reviewcount")
  @JsonApiAttribute()
  reviewCount?: number;

  @Column("anime_youtubevideoid")
  @JsonApiAttribute()
  youtubeVideoId?: string;

  @Column("anime_createdat", {
    type: MySqlColumn.DateTime,
    skipOnCreate: true,
    skipOnUpdate: true,
  })
  @JsonApiAttribute()
  createdAt?: Date;

  @Column("anime_updatedat", {
    type: MySqlColumn.DateTime,
    skipOnCreate: true,
    skipOnUpdate: true,
  })
  @JsonApiAttribute()
  updatedAt?: Date;


  @OneToMany("id", Season, "Season", "animeId", {
    order: ['number ASC']
  })
  @JsonApiRelationship()
  seasons?: Season[];

  @OneToMany("id", Episode, "Episode", "animeId", {
    order: ['number ASC']
  })
  @JsonApiRelationship()
  episodes?: Episode[];

  @ManyToMany("id", GenreRelationships, "GenreRelationships", "animeId", "genreId", Genre, "Genre", "id")
  @JsonApiRelationship()
  genres?: Genre[];

  @ManyToMany("id", ThemeRelationships, "ThemeRelationships", "animeId", "themeId", Theme, "Theme", "id")
  @JsonApiRelationship()
  themes?: Theme[];

  @OneToMany("id", Staff, "Staff", "animeId")
  @JsonApiRelationship()
  staff?: Staff[];

  @OneToMany("id", Review, "Review", "animeId", {
    order: ['updatedAt DESC']
  })
  @JsonApiRelationship()
  reviews?: Review[];

  @OneToMany("id", Franchise, "Franchise", "sourceId", {
    where: {
      sourceType: 'anime',
    },
  })
  @JsonApiRelationship()
  franchise?: Franchise;

  @JsonApiRelationship("anime-entry", "AnimeEntry")
  animeEntry?: AnimeEntry;


  @JsonApiAttribute() // TODO: Structuration des images (manga, anime, users, people, etc)
  get coverImage(): string | null {
    if (true || fs.existsSync(`./images/anime/cover/${this.slug}.jpg`)) {
      return `http://mangajap.000webhostapp.com/images/anime/cover/${this.slug}.jpg`;
    } else {
      return null;
    }
  }
  set coverImage(value: string | null) {
    this.slug = this.slug || slugify(this.title || this.title_en || this.title_en_jp || this.title_fr || "").toLowerCase(); // TODO: lors de la modification le slug est undefined du coup l'image s'enregistre ".jpg"

    if (value === null) {
      if (fs.existsSync(`./images/anime/cover/${this.slug}.jpg`)) {
        fs.unlinkSync(`./images/anime/cover/${this.slug}.jpg`);
      }
    } else {
      if (value.startsWith('data')) {
        value = value.split(',')[1];
      }

      fs.writeFileSync(`./images/anime/cover/${this.slug}.jpg`, value, {
        encoding: 'base64'
      });
    }
  }




  async initialize() {
    const selfUser = await User.fromAccessToken();
    if (selfUser) {
      OneToOne("id", AnimeEntry, "AnimeEntry", "animeId", {
        where: {
          userId: selfUser?.id || 0,
        }
      })(this, "animeEntry");
    }
  }


  async beforeCreate() {
    if (!this.slug) {
      this.slug = slugify(this.title || this.title_en || this.title_en_jp || this.title_fr || "");
    }
  }

  async afterFind() {
    //   $this->getWriteConnection()->execute(
    //     "
    //     UPDATE
    //         anime
    //     SET
    //         anime_seasoncount =(
    //             SELECT
    //                 COALESCE(MAX(episode_seasonnumber), 0)
    //             FROM
    //                 episode
    //             WHERE
    //                 episode_animeid = anime_id
    //         ),
    //         anime_episodecount =(
    //             SELECT
    //                 COUNT(*)
    //             FROM
    //                 episode
    //             WHERE
    //                 episode_animeid = anime_id
    //         ),
    //         anime_rating =(
    //             SELECT
    //                 AVG(animeentry_rating)
    //             FROM
    //                 animeentry
    //             WHERE
    //                 animeentry_animeid = anime_id AND animeentry_rating IS NOT NULL
    //             GROUP BY
    //                 animeentry_animeid
    //         ),
    //         anime_usercount =(
    //             SELECT
    //                 COUNT(*)
    //             FROM
    //                 animeentry
    //             WHERE
    //                 animeentry_animeid = anime_id AND animeentry_isadd = 1
    //         ),
    //         anime_favoritescount =(
    //             SELECT
    //                 COUNT(*)
    //             FROM
    //                 animeentry
    //             WHERE
    //                 animeentry_animeid = anime_id AND animeentry_isfavorites = 1
    //         ),
    //         anime_popularity =(
    //             SELECT
    //                 COALESCE(
    //                     (anime_usercount + anime_favoritescount) +
    //                     anime_usercount * COALESCE(anime_rating, 0) +
    //                     2 * COUNT(animeentry_id) * COALESCE(anime_rating, 0) *(anime_usercount + anime_favoritescount),
    //                     0
    //                 )
    //             FROM
    //                 animeentry
    //             WHERE
    //                 animeentry_animeid = anime_id AND animeentry_updatedat BETWEEN(NOW() - INTERVAL 7 DAY) AND NOW()
    //         )
    //     WHERE
    //         anime_id = :animeId",
    //     [
    //         'animeId' => $this->id
    //     ]
    // );
  }
}