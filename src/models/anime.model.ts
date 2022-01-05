import db from "../db";
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
import { getDownloadURL, ref, uploadString, deleteObject } from '@firebase/storage';
import { storage } from '../firebase-app';
import { StorageReference } from 'firebase/storage';
import { Schema, model } from 'mongoose';

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


  async create(): Promise<this> {
    const model = await super.create()
    await AnimeModel.create(model.toMongoModel());
    return model;
  }

  async update(): Promise<this> {
    const model = await super.update()
    await AnimeModel.findByIdAndUpdate(model.id, {
      $set: model.toMongoModel(),
    });
    return model;
  }

  async delete(): Promise<number> {
    const result = await super.delete();
    await AnimeModel.findByIdAndDelete(this.id);
    return result;
  }

  toMongoModel(): IAnime {
    return {
      _id: this.id!.toString(),

      title: this.title!,
      titles: {
        fr: this.title_fr!,
        en: this.title_en!,
        en_jp: this.title_en_jp!,
        ja_jp: this.title_ja_jp!,
      },
      slug: this.slug!,
      synopsis: this.synopsis!,
      startDate: this.startDate!,
      endDate: this.endDate!,
      origin: this.origin!,
      animeType: this.animeType! as any,
      status: this.status! as any,
      youtubeVideoId: this.youtubeVideoId!,

      genres: this.genres?.filter(genre => !!genre.id)?.map(genre => genre.id!)!,
      themes: this.themes?.filter(theme => !!theme.id)?.map(theme => theme.id!)!,

      seasonCount: this.seasonCount!,
      episodeCount: this.episodeCount!,
      episodeLength: this.episodeLength!,

      averageRating: this.averageRating!,
      ratingRank: this.ratingRank!,
      popularity: this.popularity!,
      userCount: this.userCount!,
      favoritesCount: this.favoritesCount!,
      reviewCount: this.reviewCount!,

      createdAt: this.createdAt!,
      updatedAt: this.updatedAt!,
    }
  }
}


interface IAnime {
  _id: string;

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

  seasonCount: number;
  episodeCount: number;
  episodeLength: number;

  averageRating: number | null;
  ratingRank: number | null;
  popularity: number;
  userCount: number;
  favoritesCount: number;
  reviewCount: number;

  genres: string[];
  themes: string[];

  createdAt: Date;
  updatedAt: Date;
}

const AnimeSchema = new Schema<IAnime>({
  _id: {
    type: String,
    required: true,
  },


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
  },

  synopsis: {
    type: String,
    default: '',
  },

  startDate: {
    type: Date,
    required: true,
  },

  endDate: {
    type: Date,
    default: null,
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
    type: String,
    ref: 'Genre',
    default: [],
  }],

  themes: [{
    type: String,
    ref: 'Theme',
    default: [],
  }],


  createdAt: {
    type: Date,
    default: new Date(),
  },

  updatedAt: {
    type: Date,
    default: new Date(),
  },
}, {
  id: false,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

AnimeSchema.virtual('seasons', {
  ref: 'Season',
  localField: '_id',
  foreignField: 'anime'
});

AnimeSchema.virtual('episodes', {
  ref: 'Episode',
  localField: '_id',
  foreignField: 'anime'
});

AnimeSchema.virtual('staff', {
  ref: 'Staff',
  localField: '_id',
  foreignField: 'anime'
});

AnimeSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'anime'
});

AnimeSchema.virtual('franchises', {
  ref: 'Franchise',
  localField: '_id',
  foreignField: 'source'
});

//TODO: animeEntry

//TODO: coverImage
//TODO: bannerImage


export const AnimeModel = model<IAnime>('Anime', AnimeSchema);