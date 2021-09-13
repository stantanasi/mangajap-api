import { Request } from "express";
import db from "../db";
import fs from "fs";
import JsonApi from "../utils/json-api/json-api";
import { JsonApiType, JsonApiFilter, JsonApiId, JsonApiAttribute, JsonApiRelationship } from "../utils/json-api/json-api-annotations";
import MySqlModel from "../utils/mysql/mysql-model";
import { Column, Entity, OneToMany, PrimaryKey } from "../utils/mysql/mysql-annotations";
import { MySqlColumn } from "../utils/mysql/mysql-column";
import AnimeEntry from "./anime-entry.model";
import Follow from "./follow.model";
import MangaEntry from "./manga-entry.model";
import Review from "./review.model";

@Entity({
  database: db,
  table: "user"
})
@JsonApiType("users")
@JsonApiFilter({
  self: (self: string, req: Request) => {
    let bearerToken = req.headers.authorization;
    if (bearerToken?.startsWith('Bearer ')) {
      bearerToken = bearerToken.substring(7);
    }

    return {
      where: {
        uid: bearerToken,
      },
      limit: 1,
    }
  },
  query: (query: string) => {
    return {
      where: {
        or: {
          pseudo: `%${query.replace("'", "''")}%`,
          slug: `%${query.replace("'", "''")}%`,
        },
      },
      order: [
        `CASE
          WHEN user_pseudo LIKE '${query.replace("'", "''")}%' THEN 0
          WHEN user_slug LIKE '${query.replace("'", "''")}%' THEN 1
          ELSE 2
        END`
      ],
    }
  },
})
export default class User extends MySqlModel {

  @PrimaryKey("user_id")
  @JsonApiId()
  id?: number;


  @Column("user_accesstoken")
  @JsonApiAttribute()
  uid?: string;

  @Column("user_pseudo")
  @JsonApiAttribute()
  pseudo?: string;

  @Column("user_slug")
  @JsonApiAttribute()
  slug?: string;

  @Column("user_isadmin", {
    type: MySqlColumn.Boolean
  })
  @JsonApiAttribute()
  isAdmin?: boolean;

  @Column("user_ispremium", {
    type: MySqlColumn.Boolean
  })
  @JsonApiAttribute()
  isPremium?: boolean;

  @Column("user_firstname")
  @JsonApiAttribute()
  firstName?: string;

  @Column("user_lastname")
  @JsonApiAttribute()
  lastName?: string;

  @Column("user_about")
  @JsonApiAttribute()
  about?: string;

  @Column("user_gender")
  @JsonApiAttribute()
  gender?: string;

  @Column("user_birthday", {
    type: MySqlColumn.Date
  })
  @JsonApiAttribute()
  birthday?: Date;

  @Column("user_country")
  @JsonApiAttribute()
  country?: string;

  @Column("user_followerscount")
  @JsonApiAttribute()
  followersCount?: number;

  @Column("user_followingcount")
  @JsonApiAttribute()
  followingCount?: number;

  @Column("user_followedmangacount")
  @JsonApiAttribute()
  followedMangaCount?: number;

  @Column("user_mangavolumesread")
  @JsonApiAttribute()
  volumesRead?: number;

  @Column("user_mangachaptersread")
  @JsonApiAttribute()
  chaptersRead?: number;

  @Column("user_followedanimecount")
  @JsonApiAttribute()
  followedAnimeCount?: number;

  @Column("user_animeepisodeswatch")
  @JsonApiAttribute()
  episodesWatch?: number;

  @Column("user_animetimespent")
  @JsonApiAttribute()
  timeSpentOnAnime?: number;

  @Column("user_createdat", {
    type: MySqlColumn.DateTime,
    skipOnCreate: true,
    skipOnUpdate: true,
  })
  @JsonApiAttribute()
  createdAt?: Date;

  @Column("user_updatedat", {
    type: MySqlColumn.DateTime,
    skipOnCreate: true,
    skipOnUpdate: true,
  })
  @JsonApiAttribute()
  updatedAt?: Date;


  @OneToMany("id", Follow, "Follow", "followedId")
  @JsonApiRelationship()
  followers?: Follow[];

  @OneToMany("id", Follow, "Follow", "followerId")
  @JsonApiRelationship()
  following?: Follow[];

  @OneToMany("id", MangaEntry, "MangaEntry", "userId", {
    where: {
      isAdd: true,
    },
    order: ["updatedAt DESC"],
    limit: 20,
  })
  @JsonApiRelationship("manga-library", "MangaEntry")
  mangaLibrary?: MangaEntry[];

  @OneToMany("id", AnimeEntry, "AnimeEntry", "userId", {
    where: {
      isAdd: true,
    },
    order: ["updatedAt DESC"],
    limit: 20,
  })
  @JsonApiRelationship("anime-library", "AnimeEntry")
  animeLibrary?: AnimeEntry[];

  @OneToMany("id", MangaEntry, "MangaEntry", "userId", {
    where: {
      isAdd: true,
      isFavorites: true,
    },
    order: ["updatedAt DESC"],
    limit: 20,
  })
  @JsonApiRelationship("manga-favorites", "MangaEntry")
  mangaFavorites?: MangaEntry[];

  @OneToMany("id", AnimeEntry, "AnimeEntry", "userId", {
    where: {
      isAdd: true,
      isFavorites: true,
    },
    order: ["updatedAt DESC"],
    limit: 20,
  })
  @JsonApiRelationship("anime-favorites", "AnimeEntry")
  animeFavorites?: AnimeEntry[];

  @OneToMany("id", Review, "Review", "userId")
  @JsonApiRelationship()
  reviews?: Review[];


  @JsonApiAttribute() // TODO: Structuration des images (manga, anime, users, people, etc)
  get avatar(): any | null {
    if (fs.existsSync(`./users/${this.id}/images/profile.jpg`)) {
      return {
        tiny: `https://mangajap.000webhostapp.com/media/users/avatars/${this.id}/tiny.jpeg`,
        small: `https://mangajap.000webhostapp.com/media/users/avatars/${this.id}/small.jpeg`,
        medium: `https://mangajap.000webhostapp.com/media/users/avatars/${this.id}/medium.jpeg`,
        large: `https://mangajap.000webhostapp.com/media/users/avatars/${this.id}/large.jpeg`,
        original: `https://mangajap.000webhostapp.com/media/users/avatars/${this.id}/original.jpeg`
      };
    } else {
      return null;
    }
  }
  set avatar(value: string | null) {
    if (value === null) {
      if (fs.existsSync(`./users/${this.id}/images/profile.jpg`)) {
        fs.unlinkSync(`./users/${this.id}/images/profile.jpg`)
      }
    } else {
      if (value.startsWith('data')) {
        value = value.split(',')[1];
      }

      fs.writeFileSync(`./users/${this.id}/images/profile.jpg`, value, {
        encoding: 'base64'
      })
    }
  }



  async afterFind() {
    //   $this->getWriteConnection()->execute(
    //     "
    //     UPDATE
    //         user
    //     SET
    //         user_followerscount =(
    //             SELECT
    //                 COUNT(*)
    //             FROM
    //                 follow
    //             WHERE
    //                 follow_followedid = user_id
    //         ),
    //         user_followingcount =(
    //             SELECT
    //                 COUNT(*)
    //             FROM
    //                 follow
    //             WHERE
    //                 follow_followerid = user_id
    //         ),
    //         user_followedmangacount =(
    //             SELECT
    //                 COUNT(*)
    //             FROM
    //                 mangaentry
    //             WHERE
    //                 mangaentry_userid = user_id AND mangaentry_isadd = 1
    //         ),
    //         user_mangavolumesread =(
    //             SELECT
    //                 COALESCE(
    //                     SUM(
    //                         mangaentry_volumesread *(mangaentry_rereadcount +1)
    //                     ),
    //                     0
    //                 )
    //             FROM
    //                 mangaentry
    //             WHERE
    //                 mangaentry_userid = user_id
    //         ),
    //         user_mangachaptersread =(
    //             SELECT
    //                 COALESCE(
    //                     SUM(
    //                         mangaentry_chaptersread *(mangaentry_rereadcount +1)
    //                     ),
    //                     0
    //                 )
    //             FROM
    //                 mangaentry
    //             WHERE
    //                 mangaentry_userid = user_id
    //         ),
    //         user_followedanimecount =(
    //             SELECT
    //                 COUNT(*)
    //             FROM
    //                 animeentry
    //             WHERE
    //                 animeentry_userid = user_id AND animeentry_isadd = 1
    //         ),
    //         user_animeepisodeswatch =(
    //             SELECT
    //                 COALESCE(
    //                     SUM(
    //                         animeentry_episodeswatch *(animeentry_rewatchcount +1)
    //                     ),
    //                     0
    //                 )
    //             FROM
    //                 animeentry
    //             WHERE
    //                 animeentry_userid = user_id
    //         ),
    //         user_animetimespent =(
    //             SELECT
    //                 COALESCE(
    //                     SUM(
    //                         animeentry_episodeswatch * TIME_TO_SEC(anime_episodelength)
    //                     ),
    //                     0
    //                 )
    //             FROM
    //                 animeentry
    //             RIGHT OUTER JOIN anime ON anime_id = animeentry_animeid
    //             WHERE
    //                 animeentry_userid = user_id
    //         )
    //     WHERE
    //         user_id = :userId",
    //     [
    //         'userId' => $this->getId()
    //     ]
    // );
  }



  private static selfUser: User | null;

  // TODO:
  public static async fromAccessToken(req?: Request): Promise<User | null> {
    let bearerToken = req ? req.headers.authorization : JsonApi.req.headers.authorization;
    if (bearerToken?.startsWith('Bearer ')) {
      bearerToken = bearerToken.substring(7);
    }

    if (!bearerToken) {
      return null;
    }

    if (!User.selfUser || User.selfUser.uid !== bearerToken) {
      User.selfUser = await User.findOne({
        where: {
          uid: bearerToken,
        }
      })
    }

    return User.selfUser;
  }
}