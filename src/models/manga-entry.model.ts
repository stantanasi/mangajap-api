import db from "../db";
import { JsonApiType, JsonApiFilter, JsonApiId, JsonApiAttribute, JsonApiRelationship } from "../utils/json-api/json-api-annotations";
import JsonApiError from "../utils/json-api/json-api.error";
import MySqlModel from "../utils/mysql/mysql-model";
import { Entity, PrimaryKey, Column, BelongsTo } from "../utils/mysql/mysql-annotations";
import { MySqlColumn } from "../utils/mysql/mysql-column";
import Manga from "./manga.model";
import User from "./user.model";
import { Schema, model } from 'mongoose';
import JsonApiSerializer from "../utils/mongoose-jsonapi/jsonapi-serializer";

@Entity({
  database: db,
  table: "mangaentry"
})
@JsonApiType("mangaEntries", {
  endpoint: "manga-entries"
})
@JsonApiFilter({
  status: (status: string) => {
    return {
      where: {
        status: status,
      },
    }
  },
})
export default class MangaEntry extends MySqlModel {

  @PrimaryKey("mangaentry_id")
  @JsonApiId()
  id?: number;


  @Column("mangaentry_userid", {
    skipOnUpdate: true,
  })
  userId?: number;

  @Column("mangaentry_mangaid", {
    skipOnUpdate: true,
  })
  mangaId?: number;


  @Column("mangaentry_isadd", {
    type: MySqlColumn.Boolean
  })
  @JsonApiAttribute()
  isAdd?: boolean;

  @Column("mangaentry_isfavorites", {
    type: MySqlColumn.Boolean
  })
  @JsonApiAttribute()
  isFavorites?: boolean;

  @Column("mangaentry_isprivate", {
    type: MySqlColumn.Boolean
  })
  @JsonApiAttribute()
  isPrivate?: boolean;

  @Column("mangaentry_status")
  @JsonApiAttribute()
  status?: string;

  @Column("mangaentry_volumesread")
  @JsonApiAttribute()
  volumesRead?: number;

  @Column("mangaentry_chaptersread")
  @JsonApiAttribute()
  chaptersRead?: number;

  @Column("mangaentry_rating")
  @JsonApiAttribute()
  rating?: number;

  @Column("mangaentry_startedat", {
    type: MySqlColumn.DateTime
  })
  @JsonApiAttribute()
  startedAt?: Date;

  @Column("mangaentry_finishedat", {
    type: MySqlColumn.DateTime
  })
  @JsonApiAttribute()
  finishedAt?: Date;

  @Column("mangaentry_createdat", {
    type: MySqlColumn.DateTime,
    skipOnCreate: true,
    skipOnUpdate: true,
  })
  @JsonApiAttribute()
  createdAt?: Date;

  @Column("mangaentry_updatedat", {
    type: MySqlColumn.DateTime,
    skipOnCreate: true,
    skipOnUpdate: true,
  })
  @JsonApiAttribute()
  updatedAt?: Date;


  @BelongsTo("mangaId", Manga, "Manga", "id")
  @JsonApiRelationship()
  manga?: Manga;

  @BelongsTo("userId", User, "User", "id")
  @JsonApiRelationship()
  user?: User;



  async beforeCreate() {
    const mangaEntry = await MangaEntry.findOne({
      where: {
        userId: this.userId?.toString() || "",
        mangaId: this.mangaId?.toString() || "",
      }
    });

    if (mangaEntry) {
      throw new JsonApiError({
        title: "Already existing"
      })
    }
  }
}


export interface IMangaEntry {
  _id: string;

  isAdd: boolean;
  isFavorites: boolean;
  status: 'reading' | 'completed' | 'planned' | 'on_hold' | 'dropped';
  volumesRead: number;
  chaptersRead: number;
  rating: number | null;
  startedAt: Date | null;
  finishedAt: Date | null;

  user: string;
  manga: string;

  createdAt: Date;
  updatedAt: Date;
}

export const MangaEntrySchema = new Schema<IMangaEntry>({
  _id: {
    type: String,
    required: true
  },


  isAdd: {
    type: Boolean,
    default: false
  },

  isFavorites: {
    type: Boolean,
    default: false
  },

  status: {
    type: String,
    default: 'reading',
    enum: ['reading', 'completed', 'planned', 'on_hold', 'dropped']
  },

  volumesRead: {
    type: Number,
    default: 0
  },

  chaptersRead: {
    type: Number,
    default: 0
  },

  rating: {
    type: Number,
    default: null
  },

  startedAt: {
    type: Date,
    default: new Date()
  },

  finishedAt: {
    type: Date,
    default: null
  },


  user: {
    type: String,
    ref: 'User',
    required: true
  },

  manga: {
    type: String,
    ref: 'Manga',
    required: true
  },
}, {
  id: false,
  versionKey: false,
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

MangaEntrySchema.index({
  user: 1,
  manga: 1
}, { unique: true });


export const MangaEntryModel = model<IMangaEntry>('MangaEntry', MangaEntrySchema);


JsonApiSerializer.register('manga-entries', MangaEntryModel);
