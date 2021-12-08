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
import { getDownloadURL, ref, uploadString, deleteObject, StorageReference } from '@firebase/storage';
import { storage } from '../firebase-app';
import { Schema, model } from 'mongoose';

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


  private _coverImage?: string | null;
  @JsonApiAttribute()
  get coverImage(): string | null | Promise<string | null> {
    return `https://firebasestorage.googleapis.com/v0/b/mangajap.appspot.com/o/${`manga/${this.id}/images/cover.jpg`.replace(/\//g, '%2F')}?alt=media`
    return getDownloadURL(ref(storage, `manga/${this.id}/images/cover.jpg`))
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
    return `https://firebasestorage.googleapis.com/v0/b/mangajap.appspot.com/o/${`manga/${this.id}/images/banner.jpg`.replace(/\//g, '%2F')}?alt=media`
    return getDownloadURL(ref(storage, `manga/${this.id}/images/banner.jpg`))
      .then(downloadURL => downloadURL)
      .catch(() => null);
  }
  set bannerImage(value: string | null | Promise<string | null>) {
    if (!(value instanceof Promise)) {
      this._bannerImage = value;
    }
  }



  async initialize() {
    // TODO:
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

    // TODO: cronjobs
    // $mangas = Manga::getInstance()->getWriteConnection()->query("
    //     SELECT
    //         *
    //     FROM
    //         manga;");
    // foreach ($mangas as &$manga) {
    //     $rating = $manga['manga_rating'];
    //     $userCount = $manga['manga_usercount'];
    //     $favoritesCount = $manga['manga_favoritescount'];
    //     $manga['manga_weightedrank'] = ($userCount + $favoritesCount) + $rating * $userCount + 2 * $rating * $favoritesCount;
    // }
    // array_multisort(array_column($mangas, 'manga_weightedrank'), SORT_DESC, $mangas);
    // for($i=0; $i<count($mangas); $i++) {
    //     $mangaId = $mangas[$i]["manga_id"];
    //     $mangaRank = $i + 1;

    //     Manga::getInstance()->getWriteConnection()->execute("
    //         UPDATE
    //             manga
    //         SET
    //             manga_ratingrank = :mangaRank
    //         WHERE
    //           manga_id = :mangaId;",
    //         [
    //             'mangaId' => $mangaId,
    //             'mangaRank' => $mangaRank
    //         ]);
    // }
  }

  async afterSave(old: Manga) {
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
        ref(storage, `manga/${this.id}/images/cover.jpg`),
        old._coverImage,
      );
    }

    if (old._bannerImage !== undefined) {
      await uploadFile(
        ref(storage, `manga/${this.id}/images/banner.jpg`),
        old._bannerImage,
      );
    }
  }


  async create(): Promise<this> {
    const model = await super.create()
    await MangaModel.create(model.toMongoModel());
    return model;
  }

  async update(): Promise<this> {
    const model = await super.update()
    await MangaModel.findByIdAndUpdate(model.id, {
      $set: model.toMongoModel(),
    });
    return model;
  }

  toMongoModel(): IManga {
    return {
      _id: this.id!.toString(),

      title: this.title!,
      titles: {
        fr: this.title_fr!,
        en: this.title_en!,
        en_jp: this.title_en_jp!,
        ja_jp: this.title_ja_jp!,
        kr: this.title_kr!,
      },
      slug: this.slug!,
      synopsis: this.slug!,
      startDate: this.startDate!,
      endDate: this.endDate!,
      origin: this.origin!,
      mangaType: this.mangaType! as any,
      status: this.status! as any,

      genres: this.genres?.filter(genre => !!genre.id)?.map(genre => genre.id!)!,
      themes: this.themes?.filter(theme => !!theme.id)?.map(theme => theme.id!)!,

      volumeCount: this.volumeCount!,
      chapterCount: this.chapterCount!,

      averageRating: this.averageRating!,
      ratingRank: this.ratingRank!,
      popularity: this.popularity!,
      userCount: this.popularity!,
      favoritesCount: this.favoritesCount!,
      reviewCount: this.reviewCount!,

      createdAt: this.createdAt!,
      updatedAt: this.updatedAt!,
    }
  }
}


export interface IManga {
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
  mangaType: 'bd' | 'comics' | 'josei' | 'kodomo' | 'seijin' | 'seinen' | 'shojo' | 'shonen' | 'doujin' | 'novel' | 'oneshot' | 'webtoon';
  status: 'publishing' | 'finished' | 'unreleased' | 'upcoming';

  genres: string[];
  themes: string[];

  volumeCount: number;
  chapterCount: number;

  averageRating: number | null;
  ratingRank: number | null;
  popularity: number;
  userCount: number;
  favoritesCount: number;
  reviewCount: number;

  createdAt: Date;
  updatedAt: Date;
}

const MangaSchema = new Schema<IManga>({
  _id: {
    type: String,
    required: true
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
    lowercase: true,
    // TODO: setter on title
  },

  synopsis: {
    type: String,
    default: '',
  },

  startDate: {
    type: Date,
    required: true
  },

  endDate: {
    type: Date,
    default: null
  },

  origin: {
    type: String,
    default: '',
  },

  mangaType: {
    type: String,
    required: true,
    enum: ['bd', 'comics', 'josei', 'kodomo', 'seijin', 'seinen', 'shojo', 'shonen', 'doujin', 'novel', 'oneshot', 'webtoon'],
  },

  status: {
    type: String,
    required: true,
    enum: ['publishing', 'finished', 'unreleased', 'upcoming'],
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


  volumeCount: {
    type: Number,
    default: 0
  },

  chapterCount: {
    type: Number,
    default: 0
  },


  averageRating: {
    type: Number,
    default: null
  },

  ratingRank: {
    type: Number,
    default: null
  },

  popularity: {
    type: Number,
    default: 0
  },

  userCount: {
    type: Number,
    default: 0
  },

  favoritesCount: {
    type: Number,
    default: 0
  },

  reviewCount: {
    type: Number,
    default: 0
  },


  createdAt: {
    type: Date,
    default: new Date()
  },

  updatedAt: {
    type: Date,
    default: new Date()
  },
}, {
  id: false,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

MangaSchema.virtual('volumes', {
  ref: 'Volume',
  localField: '_id',
  foreignField: 'manga'
});

MangaSchema.virtual('staff', {
  ref: 'Staff',
  localField: '_id',
  foreignField: 'manga'
});

MangaSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'manga'
});

MangaSchema.virtual('franchises', {
  ref: 'Franchise',
  localField: '_id',
  foreignField: 'source'
});

//TODO: mangaEntry

//TODO: coverImage
//TODO: bannerImage


export const MangaModel = model<IManga>('Manga', MangaSchema);
