import MongooseJsonApi, { JsonApiInstanceMethods, JsonApiModel, JsonApiQueryHelper } from "@stantanasi/mongoose-jsonapi";
import { HydratedDocument, model, Model, Schema, Types } from "mongoose";
import { TAnime } from "./anime.model";
import { TManga } from "./manga.model";

export interface IGenre {
  _id: Types.ObjectId;

  name: Map<string, string>;

  animes?: TAnime[];
  mangas?: TManga[];

  createdAt: Date;
  updatedAt: Date;
}

export type GenreInstanceMethods = JsonApiInstanceMethods

export type GenreQueryHelper = JsonApiQueryHelper

export type GenreModel = Model<IGenre, GenreQueryHelper, GenreInstanceMethods> & JsonApiModel<IGenre>

export const GenreSchema = new Schema<IGenre, GenreModel, GenreInstanceMethods, GenreQueryHelper>({
  name: {
    type: Map,
    of: String,
    default: {},
    validate: {
      validator: function (value: IGenre['name']) {
        return value.size > 0 && Array.from(value.values()).every((v) => !!v);
      },
      message: 'Invalid name',
    },
  },
}, {
  id: false,
  versionKey: false,
  timestamps: true,
  minimize: false,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

GenreSchema.virtual("animes", {
  ref: "Anime",
  localField: "_id",
  foreignField: "genres",
});

GenreSchema.virtual("mangas", {
  ref: "Manga",
  localField: "_id",
  foreignField: "genres",
});


GenreSchema.plugin(MongooseJsonApi, {
  type: "genres",
});


export type TGenre = HydratedDocument<IGenre, GenreInstanceMethods, GenreQueryHelper>;

const Genre = model<IGenre, GenreModel>("Genre", GenreSchema);
export default Genre;
