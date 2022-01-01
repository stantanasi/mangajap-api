import db from "../db";
import { JsonApiType, JsonApiId, JsonApiAttribute, JsonApiRelationship } from "../utils/json-api/json-api-annotations";
import MySqlModel from "../utils/mysql/mysql-model";
import { Entity, PrimaryKey, Column, BelongsTo } from "../utils/mysql/mysql-annotations";
import { MySqlColumn } from "../utils/mysql/mysql-column";
import Anime, { IAnime } from "./anime.model";
import Season, { ISeason } from "./season.model";
import { model, Schema } from 'mongoose';
import JsonApiSerializer from "../utils/mongoose-jsonapi/jsonapi-serializer";

@Entity({
  database: db,
  table: "episode"
})
@JsonApiType("episodes")
export default class Episode extends MySqlModel {

  @PrimaryKey("episode_id")
  @JsonApiId()
  id?: number;

  @Column("episode_animeid")
  animeId?: number;

  @Column("episode_seasonid")
  seasonId?: number;


  @Column("episode_title_fr")
  @JsonApiAttribute("titles.fr")
  title_fr?: string;

  @Column("episode_title_en")
  @JsonApiAttribute("titles.en")
  title_en?: string;

  @Column("episode_title_en_jp")
  @JsonApiAttribute("titles.en_jp")
  title_en_jp?: string;

  @Column("episode_title_ja_jp")
  @JsonApiAttribute("titles.ja_jp")
  title_ja_jp?: string;

  @Column("episode_relativenumber")
  @JsonApiAttribute()
  relativeNumber?: number;

  @Column("episode_number")
  @JsonApiAttribute()
  number?: number;

  @Column("episode_airdate", {
    type: MySqlColumn.Date
  })
  @JsonApiAttribute()
  airDate?: Date;

  @Column("episode_type")
  @JsonApiAttribute()
  episodeType?: string;

  @Column("episode_createdat", {
    type: MySqlColumn.DateTime,
    skipOnCreate: true,
    skipOnUpdate: true,
  })
  @JsonApiAttribute()
  createdAt?: Date;

  @Column("episode_updatedat", {
    type: MySqlColumn.DateTime,
    skipOnCreate: true,
    skipOnUpdate: true,
  })
  @JsonApiAttribute()
  updatedAt?: Date;


  @BelongsTo("animeId", Anime, "Anime", "id")
  @JsonApiRelationship()
  anime?: Anime;

  @BelongsTo("seasonId", Season, "Season", "id")
  @JsonApiRelationship()
  season?: Season;
}


export interface IEpisode {
  _id: string;

  titles: {
    [language: string]: string;
  };
  relativeNumber: number;
  number: number;
  airDate: Date | null;
  episodeType: '' | 'oav';

  anime: string & IAnime;
  season: string & ISeason;

  createdAt: Date;
  updatedAt: Date;
}

export const EpisodeSchema = new Schema<IEpisode>({
  _id: {
    type: String,
    required: true
  },

  
  titles: {
    type: Schema.Types.Mixed,
    default: {},
  },
  
  relativeNumber: {
    type: Number,
    required: true
  },
  
  number: {
    type: Number,
    required: true
  },
  
  airDate: {
    type: Date,
    default: null
  },
  
  episodeType: {
    type: String,
    default: '',
    enum: ['', 'oav']
  },

  
  anime: {
    type: String,
    ref: 'Anime',
    required: true
  },
  
  season: {
    type: String,
    ref: 'Season',
    required: true
  },
}, {
  id: false,
  versionKey: false,
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});


export const EpisodeModel = model<IEpisode>('Episode', EpisodeSchema);


JsonApiSerializer.register('episodes', EpisodeModel);
