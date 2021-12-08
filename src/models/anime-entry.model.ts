import db from "../db";
import { JsonApiAttribute, JsonApiFilter, JsonApiId, JsonApiRelationship, JsonApiType } from "../utils/json-api/json-api-annotations";
import JsonApiError from "../utils/json-api/json-api.error";
import MySqlModel from "../utils/mysql/mysql-model";
import { BelongsTo, Column, Entity, PrimaryKey } from "../utils/mysql/mysql-annotations";
import { MySqlColumn } from "../utils/mysql/mysql-column";
import Anime from "./anime.model";
import User from "./user.model";
import { Schema, model } from 'mongoose';

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


  async create(): Promise<this> {
    const model = await super.create()
    await AnimeEntryModel.create(model.toMongoModel());
    return model;
  }

  async update(): Promise<this> {
    const model = await super.update()
    await AnimeEntryModel.findByIdAndUpdate(model.id, {
      $set: model.toMongoModel(),
    });
    return model;
  }

  toMongoModel(): IAnimeEntry {
    return {
      _id: this.id!.toString(),

      isAdd: this.isAdd!,
      isFavorites: this.isFavorites!,
      status: this.status! as any,
      episodesWatch: this.episodesWatch!,
      rating: this.rating!,
      startedAt: this.startedAt!,
      finishedAt: this.finishedAt!,

      user: this.userId!.toString(),
      anime: this.animeId!.toString(),

      createdAt: this.createdAt!,
      updatedAt: this.updatedAt!,
    }
  }
}


export interface IAnimeEntry {
  _id: string;

  isAdd: boolean;
  isFavorites: boolean;
  status: 'watching' | 'completed' | 'planned' | 'on_hold' | 'dropped';
  episodesWatch: number;
  rating: number | null;
  startedAt: Date | null;
  finishedAt: Date | null;

  user: string;
  anime: string;

  createdAt: Date;
  updatedAt: Date;
}

const AnimeEntrySchema = new Schema<IAnimeEntry>({
  _id: {
    type: String,
    required: true
  },


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
    type: String,
    ref: 'User',
    required: true
  },

  anime: {
    type: String,
    ref: 'Anime',
    required: true
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

AnimeEntrySchema.index({
  user: 1,
  anime: 1
}, { unique: true });

export const AnimeEntryModel = model<IAnimeEntry>('AnimeEntry', AnimeEntrySchema);
