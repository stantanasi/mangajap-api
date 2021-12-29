import { Schema, model } from 'mongoose';
import db from "../db";
import { JsonApiAttribute, JsonApiId, JsonApiRelationship, JsonApiType } from "../utils/json-api/json-api-annotations";
import JsonApiSerializer from '../utils/mongoose-jsonapi/jsonapi-serializer';
import { BelongsTo, Column, Entity, OneToMany, PrimaryKey } from "../utils/mysql/mysql-annotations";
import { MySqlColumn } from "../utils/mysql/mysql-column";
import MySqlModel from "../utils/mysql/mysql-model";
import Anime from "./anime.model";
import Episode from "./episode.model";

@Entity({
  database: db,
  table: "season"
})
@JsonApiType("seasons")
export default class Season extends MySqlModel {

  @PrimaryKey("season_id")
  @JsonApiId()
  id?: number;


  @Column("season_animeid")
  animeId?: number;


  @Column("season_title_fr")
  @JsonApiAttribute("titles.fr")
  title_fr?: string;

  @Column("season_title_en")
  @JsonApiAttribute("titles.en")
  title_en?: string;

  @Column("season_title_en_jp")
  @JsonApiAttribute("titles.en_jp")
  title_en_jp?: string;

  @Column("season_title_ja_jp")
  @JsonApiAttribute("titles.ja_jp")
  title_ja_jp?: string;

  @Column("season_number")
  @JsonApiAttribute()
  number?: number;

  @Column("season_episodecount")
  @JsonApiAttribute()
  episodeCount?: number;

  @Column("season_createdat", {
    type: MySqlColumn.DateTime,
    skipOnCreate: true,
    skipOnUpdate: true,
  })
  @JsonApiAttribute()
  createdAt?: Date;

  @Column("season_updatedat", {
    type: MySqlColumn.DateTime,
    skipOnCreate: true,
    skipOnUpdate: true,
  })
  @JsonApiAttribute()
  updatedAt?: Date;


  @BelongsTo("animeId", Anime, "Anime", "id")
  @JsonApiRelationship()
  anime?: Anime;

  @OneToMany("id", Episode, "Episode", "seasonId", {
    order: ['number ASC']
  })
  @JsonApiRelationship()
  episodes?: Episode[];
}


export interface ISeason {
  _id: string;

  titles: {
    [language: string]: string;
  };
  number: number;
  episodeCount: number;

  anime: string;

  createdAt: Date;
  updatedAt: Date;
}

export const SeasonSchema = new Schema<ISeason>({
  _id: {
    type: String,
    required: true
  },


  titles: {
    type: Schema.Types.Mixed,
    default: {},
  },

  number: {
    type: Number,
    required: true
  },

  episodeCount: {
    type: Number,
    default: 0
  },


  anime: {
    type: String,
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

SeasonSchema.virtual('episodes', {
  ref: 'Episode',
  localField: '_id',
  foreignField: 'season',
  options: {
    sort: { number: 1 },
  },
});


export const SeasonModel = model<ISeason>('Season', SeasonSchema);


JsonApiSerializer.register('seasons', SeasonModel);
