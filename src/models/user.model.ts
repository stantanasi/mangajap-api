import { Request } from "express";
import db from "../db";
import JsonApi from "../utils/json-api/json-api";
import { JsonApiType, JsonApiFilter, JsonApiId, JsonApiAttribute, JsonApiRelationship } from "../utils/json-api/json-api-annotations";
import MySqlModel from "../utils/mysql/mysql-model";
import { Column, Entity, OneToMany, PrimaryKey } from "../utils/mysql/mysql-annotations";
import { MySqlColumn } from "../utils/mysql/mysql-column";
import AnimeEntry, { AnimeEntryModel, IAnimeEntry } from "./anime-entry.model";
import Follow, { FollowModel, IFollow } from "./follow.model";
import MangaEntry, { IMangaEntry, MangaEntryModel } from "./manga-entry.model";
import Review, { IReview } from "./review.model";
import { getDownloadURL, ref, uploadString, deleteObject } from '@firebase/storage';
import { storage } from '../firebase-app';
import { StorageReference } from 'firebase/storage';
import { Schema, model } from 'mongoose';
import JsonApiSerializer from "../utils/mongoose-jsonapi/jsonapi-serializer";

@Entity({
  database: db,
  table: "user"
})
@JsonApiType("users")
@JsonApiFilter({
  self: (self: string, req: Request) => { // TODO: filter self
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
        },
      },
      order: [
        `CASE
          WHEN user_pseudo LIKE '${query.replace("'", "''")}%' THEN 0
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


  @Column("user_uid")
  @JsonApiAttribute()
  uid?: string;

  @Column("user_pseudo")
  @JsonApiAttribute()
  pseudo?: string;

  @Column("user_isadmin", {
    type: MySqlColumn.Boolean,
    skipOnCreate: true,
    skipOnUpdate: true,
  })
  @JsonApiAttribute()
  isAdmin?: boolean;

  @Column("user_ispremium", {
    type: MySqlColumn.Boolean,
    skipOnCreate: true,
    skipOnUpdate: true,
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


  private _avatar?: string | null;
  @JsonApiAttribute()
  get avatar(): any | null | Promise<string | null> {
    const downloadURL = `https://firebasestorage.googleapis.com/v0/b/mangajap.appspot.com/o/${`users/${this.id}/images/profile.jpg`.replace(/\//g, '%2F')}?alt=media`;
    return {
      tiny: downloadURL,
      small: downloadURL,
      medium: downloadURL,
      large: downloadURL,
      original: downloadURL,
    }
    return getDownloadURL(ref(storage, `users/${this.id}/images/profile.jpg`))
      .then(downloadURL => ({
        tiny: downloadURL,
        small: downloadURL,
        medium: downloadURL,
        large: downloadURL,
        original: downloadURL,
      }))
      .catch(() => null);
  }
  set avatar(value: string | null | Promise<string | null>) {
    if (!(value instanceof Promise)) {
      this._avatar = value;
    }
  }



  async afterFind() {
    db.connection.promise().query(`
        UPDATE
            user
        SET
            user_followerscount =(
                SELECT
                    COUNT(*)
                FROM
                    follow
                WHERE
                    follow_followedid = user_id
            ),
            user_followingcount =(
                SELECT
                    COUNT(*)
                FROM
                    follow
                WHERE
                    follow_followerid = user_id
            ),
            user_followedmangacount =(
                SELECT
                    COUNT(*)
                FROM
                    mangaentry
                WHERE
                    mangaentry_userid = user_id AND mangaentry_isadd = 1
            ),
            user_mangavolumesread =(
                SELECT
                    COALESCE(
                        SUM(
                            mangaentry_volumesread *(mangaentry_rereadcount +1)
                        ),
                        0
                    )
                FROM
                    mangaentry
                WHERE
                    mangaentry_userid = user_id
            ),
            user_mangachaptersread =(
                SELECT
                    COALESCE(
                        SUM(
                            mangaentry_chaptersread *(mangaentry_rereadcount +1)
                        ),
                        0
                    )
                FROM
                    mangaentry
                WHERE
                    mangaentry_userid = user_id
            ),
            user_followedanimecount =(
                SELECT
                    COUNT(*)
                FROM
                    animeentry
                WHERE
                    animeentry_userid = user_id AND animeentry_isadd = 1
            ),
            user_animeepisodeswatch =(
                SELECT
                    COALESCE(
                        SUM(
                            animeentry_episodeswatch *(animeentry_rewatchcount +1)
                        ),
                        0
                    )
                FROM
                    animeentry
                WHERE
                    animeentry_userid = user_id
            ),
            user_animetimespent =(
                SELECT
                    COALESCE(
                        SUM(
                            animeentry_episodeswatch * TIME_TO_SEC(anime_episodelength)
                        ),
                        0
                    )
                FROM
                    animeentry
                RIGHT OUTER JOIN anime ON anime_id = animeentry_animeid
                WHERE
                    animeentry_userid = user_id
            )
        WHERE
            user_id = ${this.id}`)
      .then()
      .catch();
  }

  async afterSave(old: User) {
    const uploadFile = (storageRef: StorageReference, file: string | null) => {
      if (file === null) {
        return deleteObject(storageRef)
          .then()
          .catch();
      } else {
        file = file.replace(/(\r\n|\n|\r)/gm, '');

        if (file.startsWith('data')) {
          return uploadString(storageRef, file, 'data_url')
            .then();
        } else {
          return uploadString(storageRef, file, 'base64')
            .then();
        }
      }
    }

    if (old._avatar !== undefined) {
      await uploadFile(
        ref(storage, `users/${this.id}/images/profile.jpg`),
        old._avatar,
      );
    }
  }



  private static selfUser: User | null;

  // TODO: (req: Request)
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


export interface IUser {
  _id: string;

  uid: string;
  isAdmin: boolean;
  isPremium: boolean;

  pseudo: string;
  firstName: string;
  lastName: string;
  about: string;
  gender: 'men' | 'women' | 'other' | null;
  birthday: Date | null;
  country: string;
  avatar: {
    tiny: string;
    small: string;
    medium: string;
    large: string;
    original: string;
  } | null;

  followersCount: number;
  followingCount: number;
  followedMangaCount: number;
  volumesRead: number;
  chaptersRead: number;
  followedAnimeCount: number;
  episodesWatch: number;
  timeSpentOnAnime: number;

  followers?: IFollow[];
  following?: IFollow[];
  'anime-library'?: IAnimeEntry[];
  'manga-library'?: IMangaEntry[];
  'anime-favorites'?: IAnimeEntry[];
  'manga-favorites'?: IMangaEntry[];
  reviews?: IReview[];

  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = new Schema<IUser>({
  _id: {
    type: String,
    required: true
  },


  uid: {
    type: String,
    required: true
  },

  isAdmin: {
    type: Boolean,
    default: false
  },

  isPremium: {
    type: Boolean,
    default: false
  },


  pseudo: {
    type: String,
    required: true
  },

  firstName: {
    type: String,
    default: ''
  },

  lastName: {
    type: String,
    default: ''
  },

  about: {
    type: String,
    default: ''
  },

  gender: {
    type: String,
    default: null,
    enum: ['men', 'women', 'other', null]
  },

  birthday: {
    type: Date,
    default: null
  },

  country: {
    type: String,
    default: ''
  },


  followersCount: {
    type: Number,
    default: 0
  },

  followingCount: {
    type: Number,
    default: 0
  },

  followedMangaCount: {
    type: Number,
    default: 0
  },

  volumesRead: {
    type: Number,
    default: 0
  },

  chaptersRead: {
    type: Number,
    default: 0
  },

  followedAnimeCount: {
    type: Number,
    default: 0
  },

  episodesWatch: {
    type: Number,
    default: 0
  },

  timeSpentOnAnime: {
    type: Number,
    default: 0
  },
}, {
  id: false,
  versionKey: false,
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

const uploadFile = (storageRef: StorageReference, file: string | null) => {
  if (file === null) {
    return deleteObject(storageRef)
      .then()
      .catch();
  } else {
    file = file.replace(/(\r\n|\n|\r)/gm, '');

    if (file.startsWith('data')) {
      return uploadString(storageRef, file, 'data_url')
        .then();
    } else {
      return uploadString(storageRef, file, 'base64')
        .then();
    }
  }
}

UserSchema.virtual('avatar')
  .get(function (this: IUser) {
    const downloadURL = `https://firebasestorage.googleapis.com/v0/b/mangajap.appspot.com/o/${`users/${this._id}/images/profile.jpg`.replace(/\//g, '%2F')}?alt=media`;
    return {
      tiny: downloadURL,
      small: downloadURL,
      medium: downloadURL,
      large: downloadURL,
      original: downloadURL,
    }
    return getDownloadURL(ref(storage, `users/${this._id}/images/profile.jpg`))
      .then(downloadURL => ({
        tiny: downloadURL,
        small: downloadURL,
        medium: downloadURL,
        large: downloadURL,
        original: downloadURL,
      }))
      .catch(() => null);
  })
  .set(function (this: IUser, value: string) {
    uploadFile(
      ref(storage, `users/${this._id}/images/profile.jpg`),
      value,
    ).then();
  });

UserSchema.virtual('followers', {
  ref: 'Follow',
  localField: '_id',
  foreignField: 'followed'
});

UserSchema.virtual('following', {
  ref: 'Follow',
  localField: '_id',
  foreignField: 'follower'
});

UserSchema.virtual('anime-library', {
  ref: 'AnimeEntry',
  localField: '_id',
  foreignField: 'user',
  match: {
    isAdd: true,
  },
  options: {
    sort: { updatedAt: -1 },
  },
  limit: 20,
});

UserSchema.virtual('manga-library', {
  ref: 'MangaEntry',
  localField: '_id',
  foreignField: 'user',
  match: {
    isAdd: true,
  },
  options: {
    sort: { updatedAt: -1 },
  },
  limit: 20,
});

UserSchema.virtual('anime-favorites', {
  ref: 'AnimeEntry',
  localField: '_id',
  foreignField: 'user',
  match: {
    isAdd: true,
    isFavorites: true,
  },
  options: {
    sort: { updatedAt: -1 },
  },
  limit: 20,
});

UserSchema.virtual('manga-favorites', {
  ref: 'MangaEntry',
  localField: '_id',
  foreignField: 'user',
  match: {
    isAdd: true,
    isFavorites: true,
  },
  options: {
    sort: { updatedAt: -1 },
  },
  limit: 20,
});

UserSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'user'
});


UserSchema.pre('findOne', async function () {
  const _id = this.getQuery()._id;
  if (!_id) return;

  await UserModel.findOneAndUpdate(this.getQuery(), {
    followersCount: await FollowModel.count({
      followed: _id
    }),

    followingCount: await FollowModel.count({
      follower: _id
    }),

    followedMangaCount: await MangaEntryModel.count({
      user: _id,
      isAdd: true,
    }),

    volumesRead: (await MangaEntryModel.aggregate([
      { $match: { user: _id } },
      {
        $group: {
          _id: null,
          total: { $sum: "$volumesRead" }
        }
      }
    ]))[0]?.total,

    chaptersRead: (await MangaEntryModel.aggregate([
      { $match: { user: _id } },
      {
        $group: {
          _id: null,
          total: { $sum: "$chaptersRead" }
        }
      }
    ]))[0]?.total,

    followedAnimeCount: await AnimeEntryModel.count({
      user: _id,
      isAdd: true,
    }),

    episodesWatch: (await AnimeEntryModel.aggregate([
      { $match: { user: _id } },
      {
        $group: {
          _id: null,
          total: { $sum: "$episodesWatch" }
        }
      }
    ]))[0]?.total,

    timeSpentOnAnime: (await AnimeEntryModel.aggregate([
      { $match: { user: _id } },
      {
        $lookup: {
          from: 'animes',
          localField: 'anime',
          foreignField: '_id',
          as: 'anime'
        }
      },
      { $unwind: '$anime' },
      {
        $group: {
          _id: null,
          timeSpentOnAnime: { $sum: { $multiply: ['$episodesWatch', '$anime.episodeLength'] } }
        }
      }
    ]))[0]?.timeSpentOnAnime,
  });
});


export const UserModel = model<IUser>('User', UserSchema);


JsonApiSerializer.register('users', UserModel, {
  self: (self: string) => {
    return {}
  },
  query: (query: string) => {
    return {
      $or: [
        {
          pseudo: {
            $regex: query,
            $options: 'i',
          },
        },
      ]
    };
  }
});
// TODO: order by query
