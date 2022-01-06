import db from "../db";
import { JsonApiAttribute, JsonApiFilter, JsonApiId, JsonApiRelationship, JsonApiType } from "../utils/json-api/json-api-annotations";
import MySqlModel from "../utils/mysql/mysql-model";
import { Column, Entity, ManyToMany, OneToMany, OneToOne, PrimaryKey } from "../utils/mysql/mysql-annotations";
import { MySqlColumn } from "../utils/mysql/mysql-column";
import Episode, { EpisodeModel, IEpisode } from "./episode.model";
import Franchise, { IFranchise } from "./franchise.model";
import GenreRelationships from "./genre-relationships.model";
import Genre, { IGenre } from "./genre.model";
import Review, { IReview, ReviewModel } from "./review.model";
import Staff, { IStaff } from "./staff.model";
import ThemeRelationships from "./theme-relationships.model";
import Theme, { ITheme } from "./theme.model";
import slugify from "slugify";
import AnimeEntry, { AnimeEntryModel, IAnimeEntry } from "./anime-entry.model";
import User from "./user.model";
import Season, { ISeason, SeasonModel } from "./season.model";
import { getDownloadURL, ref, uploadString, deleteObject } from '@firebase/storage';
import { storage, uploadFile } from '../firebase-app';
import { StorageReference } from 'firebase/storage';
import { Schema, model, Types, EnforceDocument } from 'mongoose';
import JsonApiSerializer from "../utils/mongoose-jsonapi/jsonapi-serializer";

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
  franchise?: Franchise[];

  @JsonApiRelationship("anime-entry", "AnimeEntry")
  animeEntry?: AnimeEntry;


  private _coverImage?: string | null;
  @JsonApiAttribute()
  get coverImage(): string | null | Promise<string | null> {
    return `https://firebasestorage.googleapis.com/v0/b/mangajap.appspot.com/o/${`anime/${this.id}/images/cover.jpg`.replace(/\//g, '%2F')}?alt=media`
    return getDownloadURL(ref(storage, `anime/${this.id}/images/cover.jpg`))
      .then(downloadURL => downloadURL)
      .catch(() => null);
  }
  set coverImage(value: string | null | Promise<string | null>) {
    if (!(value instanceof Promise)) {
      this._coverImage = value;
    }
  }

  private _bannerImage?: string | null;
  @JsonApiAttribute()
  get bannerImage(): string | null | Promise<string | null> {
    return `https://firebasestorage.googleapis.com/v0/b/mangajap.appspot.com/o/${`anime/${this.id}/images/banner.jpg`.replace(/\//g, '%2F')}?alt=media`
    return getDownloadURL(ref(storage, `anime/${this.id}/images/banner.jpg`))
      .then(downloadURL => downloadURL)
      .catch(() => null);
  }
  set banner(value: string | null | Promise<string | null>) {
    if (!(value instanceof Promise)) {
      this._bannerImage = value;
    }
  }




  async initialize() {
    // TODO: 
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
    db.connection.promise().query(`
        UPDATE
            anime
        SET
            anime_seasoncount =(
                SELECT
                    COALESCE(MAX(episode_seasonnumber), 0)
                FROM
                    episode
                WHERE
                    episode_animeid = anime_id
            ),
            anime_episodecount =(
                SELECT
                    COUNT(*)
                FROM
                    episode
                WHERE
                    episode_animeid = anime_id
            ),
            anime_rating =(
                SELECT
                    AVG(animeentry_rating)
                FROM
                    animeentry
                WHERE
                    animeentry_animeid = anime_id AND animeentry_rating IS NOT NULL
                GROUP BY
                    animeentry_animeid
            ),
            anime_usercount =(
                SELECT
                    COUNT(*)
                FROM
                    animeentry
                WHERE
                    animeentry_animeid = anime_id AND animeentry_isadd = 1
            ),
            anime_favoritescount =(
                SELECT
                    COUNT(*)
                FROM
                    animeentry
                WHERE
                    animeentry_animeid = anime_id AND animeentry_isfavorites = 1
            ),
            anime_popularity =(
                SELECT
                    COALESCE(
                        (anime_usercount + anime_favoritescount) +
                        anime_usercount * COALESCE(anime_rating, 0) +
                        2 * COUNT(animeentry_id) * COALESCE(anime_rating, 0) *(anime_usercount + anime_favoritescount),
                        0
                    )
                FROM
                    animeentry
                WHERE
                    animeentry_animeid = anime_id AND animeentry_updatedat BETWEEN(NOW() - INTERVAL 7 DAY) AND NOW()
            )
        WHERE
            anime_id = ${this.id}`)
      .then()
      .catch();

    // TODO: cronjobs
    // $animes = Anime::getInstance()->getWriteConnection()->query("
    //     SELECT
    //         *
    //     FROM
    //         anime;");
    // foreach ($animes as &$anime) {
    //     $rating = $anime['anime_rating'];
    //     $userCount = $anime['anime_usercount'];
    //     $favoritesCount = $anime['anime_favoritescount'];
    //     $anime['anime_weightedrank'] = ($userCount + $favoritesCount) + $rating * $userCount + 2 * $rating * $favoritesCount;
    // }
    // array_multisort(array_column($animes, 'anime_weightedrank'), SORT_DESC, $animes);
    // for($i=0; $i<count($animes); $i++) {
    //     $animeId = $animes[$i]["anime_id"];
    //     $animeRank = $i + 1;

    //     Anime::getInstance()->getWriteConnection()->execute("
    //         UPDATE
    //             anime
    //         SET
    //             anime_ratingrank = :animeRank
    //         WHERE
    //           anime_id = :animeId;",
    //         [
    //             'animeId' => $animeId,
    //             'animeRank' => $animeRank
    //         ]);
    // }
  }

  async afterSave(old: Anime) {
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

    if (old._coverImage !== undefined) {
      await uploadFile(
        ref(storage, `anime/${this.id}/images/cover.jpg`),
        old._coverImage,
      );
    }

    if (old._bannerImage !== undefined) {
      await uploadFile(
        ref(storage, `anime/${this.id}/images/banner.jpg`),
        old._bannerImage,
      );
    }
  }
}


export interface IAnime {
  _id: Types.ObjectId;

  title: string;
  titles: {
    [language: string]: string
  };
  slug: string;
  synopsis: string;
  startDate: Date;
  endDate: Date | null;
  origin: string;
  animeType: 'tv' | 'ova' | 'ona' | 'movie' | 'music' | 'special';
  status: 'airing' | 'finished' | 'unreleased' | 'upcoming';
  youtubeVideoId: string;
  coverImage: string | null;
  bannerImage: string | null;

  seasonCount: number;
  episodeCount: number;
  episodeLength: number;

  averageRating: number | null;
  ratingRank: number | null;
  popularity: number;
  userCount: number;
  favoritesCount: number;
  reviewCount: number;

  genres: Types.ObjectId[] & IGenre[];
  themes: Types.ObjectId[] & ITheme[];
  seasons?: ISeason[];
  episodes?: IEpisode[];
  staff?: IStaff[];
  reviews?: IReview[];
  franchises?: IFranchise[];
  'anime-entry'?: IAnimeEntry | null;

  createdAt: Date;
  updatedAt: Date;
}

export const AnimeSchema = new Schema<IAnime>({
  title: {
    type: String,
    required: true,
  },

  titles: {
    type: Schema.Types.Mixed,
    default: {},
  },

  slug: {
    type: String,
    required: true,
    lowercase: true,
  },

  synopsis: {
    type: String,
    default: '',
  },

  startDate: {
    type: Date,
    required: true,
    transform: function (this, val) {
      return val.toISOString().slice(0, 10);
    }
  },

  endDate: {
    type: Date,
    default: null,
    transform: function (this, val) {
      return val?.toISOString().slice(0, 10) ?? null;
    },
  },

  origin: {
    type: String,
    default: '',
  },

  animeType: {
    type: String,
    required: true,
    enum: ['tv', 'ova', 'ona', 'movie', 'music', 'special'],
  },

  status: {
    type: String,
    required: true,
    enum: ['airing', 'finished', 'unreleased', 'upcoming'],
  },

  youtubeVideoId: {
    type: String,
    default: '',
  },

  coverImage: {
    type: String,
    default: null,
  },

  bannerImage: {
    type: String,
    default: null,
  },


  seasonCount: {
    type: Number,
    default: 0,
  },

  episodeCount: {
    type: Number,
    default: 0,
  },

  episodeLength: {
    type: Number,
    default: 0,
  },


  averageRating: {
    type: Number,
    default: null,
  },

  ratingRank: {
    type: Number,
    default: null,
  },

  popularity: {
    type: Number,
    default: 0,
  },

  userCount: {
    type: Number,
    default: 0,
  },

  favoritesCount: {
    type: Number,
    default: 0,
  },

  reviewCount: {
    type: Number,
    default: 0,
  },


  genres: [{
    type: Schema.Types.ObjectId,
    ref: 'Genre',
    default: [],
  }],

  themes: [{
    type: Schema.Types.ObjectId,
    ref: 'Theme',
    default: [],
  }],
}, {
  id: false,
  versionKey: false,
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

AnimeSchema.virtual('seasons', {
  ref: 'Season',
  localField: '_id',
  foreignField: 'anime',
  options: {
    sort: { number: 1 },
  },
});

AnimeSchema.virtual('episodes', {
  ref: 'Episode',
  localField: '_id',
  foreignField: 'anime',
  options: {
    sort: { number: 1 },
  },
});

AnimeSchema.virtual('staff', {
  ref: 'Staff',
  localField: '_id',
  foreignField: 'anime'
});

AnimeSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'anime',
  options: {
    sort: { updatedAt: -1 },
  },
});

AnimeSchema.virtual('franchises', {
  ref: 'Franchise',
  localField: '_id',
  foreignField: 'source'
});

AnimeSchema.virtual('anime-entry');


AnimeSchema.pre<EnforceDocument<IAnime, {}, {}>>('save', async function () {
  // TODO: _id sera nul lors du create
  if (this.isModified('title')) {
    this.slug = slugify(this.title);
  }

  if (this.isModified('coverImage')) {
    this.coverImage = await uploadFile(
      ref(storage, `anime/${this._id}/images/cover.jpg`),
      this.coverImage,
    );
  }

  if (this.isModified('bannerImage')) {
    this.bannerImage = await uploadFile(
      ref(storage, `anime/${this._id}/images/banner.jpg`),
      this.bannerImage,
    );
  }
});

AnimeSchema.pre('findOne', async function () {
  const _id = this.getQuery()._id;
  if (!_id) return;

  await AnimeModel.findOneAndUpdate(this.getQuery(), {
    seasonCount: await SeasonModel.count({
      anime: _id,
    }),

    episodeCount: await EpisodeModel.count({
      anime: _id,
    }),

    averageRating: (await AnimeEntryModel.aggregate([
      { $match: { anime: _id } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' }
        }
      }
    ]))[0]?.averageRating,

    userCount: await AnimeEntryModel.count({
      anime: _id,
      isAdd: true,
    }),

    favoritesCount: await AnimeEntryModel.count({
      anime: _id,
      isFavorites: true,
    }),

    reviewCount: await ReviewModel.count({
      anime: _id,
    }),

    // TODO: popularity
    // result.popularity = (
    //         SELECT
    //         COALESCE(
    //             (anime_usercount + anime_favoritescount) +
    //             anime_usercount * COALESCE(anime_rating, 0) +
    //             2 * COUNT(animeentry_id) * COALESCE(anime_rating, 0) *(anime_usercount + anime_favoritescount),
    //             0
    //         )
    //     FROM
    //         animeentry
    //     WHERE
    //         animeentry_animeid = anime_id AND animeentry_updatedat BETWEEN(NOW() - INTERVAL 7 DAY) AND NOW()
    // )
  });
});


export const AnimeModel = model<IAnime>('Anime', AnimeSchema);


JsonApiSerializer.register('anime', AnimeModel, {
  query: (query: string) => {
    return {
      $or: [
        {
          title: {
            $regex: query,
            $options: 'i',
          },
        },
        {
          'titles.fr': {
            $regex: query,
            $options: 'i',
          },
        },
        {
          'titles.en': {
            $regex: query,
            $options: 'i',
          },
        },
        {
          'titles.en_jp': {
            $regex: query,
            $options: 'i',
          },
        },
        {
          'titles.ja_jp': {
            $regex: query,
            $options: 'i',
          },
        },
      ]
    };
  }
});


// TODO: cronjobs
// $animes = Anime::getInstance()->getWriteConnection()->query("
//     SELECT
//         *
//     FROM
//         anime;");
// foreach ($animes as &$anime) {
//     $rating = $anime['anime_rating'];
//     $userCount = $anime['anime_usercount'];
//     $favoritesCount = $anime['anime_favoritescount'];
//     $anime['anime_weightedrank'] = ($userCount + $favoritesCount) + $rating * $userCount + 2 * $rating * $favoritesCount;
// }
// array_multisort(array_column($animes, 'anime_weightedrank'), SORT_DESC, $animes);
// for($i=0; $i<count($animes); $i++) {
//     $animeId = $animes[$i]["anime_id"];
//     $animeRank = $i + 1;

//     Anime::getInstance()->getWriteConnection()->execute("
//         UPDATE
//             anime
//         SET
//             anime_ratingrank = :animeRank
//         WHERE
//           anime_id = :animeId;",
//         [
//             'animeId' => $animeId,
//             'animeRank' => $animeRank
//         ]);
// }
