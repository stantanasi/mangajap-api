import db from "../db";
import { JsonApiAttribute, JsonApiId, JsonApiRelationship, JsonApiType } from "../utils/json-api/json-api-annotations";
import MySqlModel from "../utils/mysql/mysql-model";
import { Column, Entity, ManyToMany, PrimaryKey } from "../utils/mysql/mysql-annotations";
import { MySqlColumn } from "../utils/mysql/mysql-column";
import Anime from "./anime.model";
import GenreRelationships from "./genre-relationships.model";
import Manga from "./manga.model";
import { Schema, model } from 'mongoose';

@Entity({
  database: db,
  table: "genre"
})
@JsonApiType("genres")
export default class Genre extends MySqlModel {

  @PrimaryKey("genre_id")
  @JsonApiId()
  id?: string;


  @Column("genre_title_fr")
  @JsonApiAttribute()
  title?: string;

  @Column("genre_description")
  @JsonApiAttribute()
  description?: string;

  @Column("genre_createdat", {
    type: MySqlColumn.DateTime,
    skipOnCreate: true,
    skipOnUpdate: true,
  })
  @JsonApiAttribute()
  createdAt?: Date;

  @Column("genre_updatedat", {
    type: MySqlColumn.DateTime,
    skipOnCreate: true,
    skipOnUpdate: true,
  })
  @JsonApiAttribute()
  updatedAt?: Date;


  @ManyToMany("id", GenreRelationships, "GenreRelationships", "genreId", "mangaId", Manga, "Manga", "id")
  @JsonApiRelationship()
  manga?: Manga[];

  @ManyToMany("id", GenreRelationships, "GenreRelationships", "genreId", "animeId", Anime, "Anime", "id")
  @JsonApiRelationship()
  anime?: Anime[];


  async create(): Promise<this> {
    const model = await super.create()
    await GenreModel.create(model.toMongoModel());
    return model;
  }

  async update(): Promise<this> {
    const model = await super.update()
    await GenreModel.findByIdAndUpdate(model.id, {
      $set: model.toMongoModel(),
    });
    return model;
  }

  async delete(): Promise<number> {
    const result = await super.delete();
    await GenreModel.findByIdAndDelete(this.id);
    return result;
  }

  toMongoModel(): IGenre {
    return {
      _id: this.id!.toString(),

      title: this.title!,
      description: this.description!,

      createdAt: this.createdAt!,
      updatedAt: this.updatedAt!,
    }
  }
}


interface IGenre {
  _id: string;

  title: string;
  description: string;

  createdAt: Date;
  updatedAt: Date;
}

const GenreSchema = new Schema<IGenre>({
  _id: {
    type: String,
    required: true
  },


  title: {
    type: String,
    required: true
  },

  description: {
    type: String,
    default: '',
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

GenreSchema.virtual('animes', {
  ref: 'Anime',
  localField: '_id',
  foreignField: 'genres'
});

GenreSchema.virtual('mangas', {
  ref: 'Manga',
  localField: '_id',
  foreignField: 'genres'
});


export const GenreModel = model<IGenre>('Genre', GenreSchema);
