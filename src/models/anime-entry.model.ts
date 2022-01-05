import db from "../db";
import { JsonApiAttribute, JsonApiFilter, JsonApiId, JsonApiRelationship, JsonApiType } from "../utils/json-api/json-api-annotations";
import JsonApiError from "../utils/json-api/json-api.error";
import MySqlModel from "../utils/mysql/mysql-model";
import { BelongsTo, Column, Entity, PrimaryKey } from "../utils/mysql/mysql-annotations";
import { MySqlColumn } from "../utils/mysql/mysql-column";
import Anime, { IAnime } from "./anime.model";
import User, { IUser } from "./user.model";
import { Schema, model, Types } from 'mongoose';
import JsonApiSerializer from "../utils/mongoose-jsonapi/jsonapi-serializer";

@Entity({
  database: db,
  table: "animeentry"
})
@JsonApiType("animeEntries", {
  endpoint: "anime-entries"
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
export default class AnimeEntry extends MySqlModel {

  @PrimaryKey("animeentry_id")
  @JsonApiId()
  id?: number;


  @Column("animeentry_userid", {
    skipOnUpdate: true,
  })
  userId?: number;

  @Column("animeentry_animeid", {
    skipOnUpdate: true,
  })
  animeId?: number;


  @Column("animeentry_isadd", {
    type: MySqlColumn.Boolean
  })
  @JsonApiAttribute()
  isAdd?: boolean;

  @Column("animeentry_isfavorites", {
    type: MySqlColumn.Boolean
  })
  @JsonApiAttribute()
  isFavorites?: boolean;

  @Column("animeentry_isprivate", {
    type: MySqlColumn.Boolean
  })
  @JsonApiAttribute()
  isPrivate?: boolean;

  @Column("animeentry_status")
  @JsonApiAttribute()
  status?: string;

  @Column("animeentry_episodeswatch")
  @JsonApiAttribute()
  episodesWatch?: number;

  @Column("animeentry_rating")
  @JsonApiAttribute()
  rating?: number;

  @Column("animeentry_startedat", {
    type: MySqlColumn.DateTime
  })
  @JsonApiAttribute()
  startedAt?: Date;

  @Column("animeentry_finishedat", {
    type: MySqlColumn.DateTime
  })
  @JsonApiAttribute()
  finishedAt?: Date;

  @Column("animeentry_createdat", {
    type: MySqlColumn.DateTime,
    skipOnCreate: true,
    skipOnUpdate: true,
  })
  @JsonApiAttribute()
  createdAt?: Date;

  @Column("animeentry_updatedat", {
    type: MySqlColumn.DateTime,
    skipOnCreate: true,
    skipOnUpdate: true,
  })
  @JsonApiAttribute()
  updatedAt?: Date;


  @BelongsTo("animeId", Anime, "Anime", "id")
  @JsonApiRelationship()
  anime?: Anime;

  @BelongsTo("userId", User, "User", "id")
  @JsonApiRelationship()
  user?: User;



  async beforeCreate() {
    const animeEntry = await AnimeEntry.findOne({
      where: {
        userId: this.userId?.toString() || "",
        animeId: this.animeId?.toString() || "",
      }
    });

    if (animeEntry) {
      throw new JsonApiError({
        title: "Already existing"
      })
    }
  }
}


export interface IAnimeEntry {
  _id: Types.ObjectId;

  isAdd: boolean;
  isFavorites: boolean;
  status: 'watching' | 'completed' | 'planned' | 'on_hold' | 'dropped';
  episodesWatch: number;
  rating: number | null;
  startedAt: Date | null;
  finishedAt: Date | null;

  user: Types.ObjectId & IUser;
  anime: Types.ObjectId & IAnime;

  createdAt: Date;
  updatedAt: Date;
}

export const AnimeEntrySchema = new Schema<IAnimeEntry>({
  isAdd: {
    type: Boolean,
    default: true
  },

  isFavorites: {
    type: Boolean,
    default: false
  },

  status: {
    type: String,
    default: 'watching',
    enum: ['watching', 'completed', 'planned', 'on_hold', 'dropped']
  },

  episodesWatch: {
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
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  anime: {
    type: Schema.Types.ObjectId,
    ref: 'Anime',
    required: true
  },
}, {
  id: false,
  versionKey: false,
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

AnimeEntrySchema.index({
  user: 1,
  anime: 1
}, { unique: true });


export const AnimeEntryModel = model<IAnimeEntry>('AnimeEntry', AnimeEntrySchema);


JsonApiSerializer.register('anime-entries', AnimeEntryModel);
