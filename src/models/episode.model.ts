import db from "../db";
import { JsonApiType, JsonApiId, JsonApiAttribute, JsonApiRelationship } from "../utils/json-api/json-api-annotations";
import MySqlModel from "../utils/mysql/mysql-model";
import { Entity, PrimaryKey, Column, BelongsTo } from "../utils/mysql/mysql-annotations";
import { MySqlColumn } from "../utils/mysql/mysql-column";
import Anime from "./anime.model";
import Season from "./season.model";
import { model, Schema } from 'mongoose';

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


  async create(): Promise<this> {
    const model = await super.create()
    await EpisodeModel.create(model.toMongoModel());
    return model;
  }

  async update(): Promise<this> {
    const model = await super.update()
    await EpisodeModel.findByIdAndUpdate(model.id, {
      $set: model.toMongoModel(),
    });
    return model;
  }

  toMongoModel(): IEpisode {
    return {
      _id: this.id!.toString(),

      titles: {
        fr: this.title_fr!,
        en: this.title_en!,
        en_jp: this.title_en_jp!,
        ja_jp: this.title_ja_jp!,
      },
      relativeNumber: this.relativeNumber!,
      number: this.number!,
      airDate: this.airDate!,
      episodeType: this.episodeType! as any,

      anime: this.animeId!.toString(),
      season: this.seasonId!.toString(),

      createdAt: this.createdAt!,
      updatedAt: this.updatedAt!,
    }
  }
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

  anime: string;
  season: string;

  createdAt: Date;
  updatedAt: Date;
}

const EpisodeSchema = new Schema<IEpisode>({
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

export const EpisodeModel = model<IEpisode>('Episode', EpisodeSchema);
