import MongooseJsonApi, { JsonApiInstanceMethods, JsonApiModel, JsonApiQueryHelper } from "@stantanasi/mongoose-jsonapi";
import { HydratedDocument, model, Model, Schema, Types } from "mongoose";
import { TAnime } from "./anime.model";
import { TManga } from "./manga.model";

export interface IGenre {
  _id: Types.ObjectId;

  title: string;
  description: string;

  animes?: TAnime[];
  mangas?: TManga[];

  createdAt: Date;
  updatedAt: Date;
}

export type GenreInstanceMethods = JsonApiInstanceMethods

export type GenreQueryHelper = JsonApiQueryHelper

export type GenreModel = Model<IGenre, GenreQueryHelper, GenreInstanceMethods> & JsonApiModel<IGenre>

export const GenreSchema = new Schema<IGenre, GenreModel, GenreInstanceMethods, GenreQueryHelper>({
  title: {
    type: String,
    required: true,
  },

  description: {
    type: String,
    default: "",
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
