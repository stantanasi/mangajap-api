import MongooseJsonApi, { JsonApiInstanceMethods, JsonApiModel, JsonApiQueryHelper } from "@stantanasi/mongoose-jsonapi";
import { HydratedDocument, model, Model, Schema, Types } from "mongoose";
import { TAnime } from "./anime.model";
import { TManga } from "./manga.model";

export interface ITheme {
  _id: Types.ObjectId;

  title: string;
  description: string;

  animes?: TAnime[];
  mangas?: TManga[];

  createdAt: Date;
  updatedAt: Date;
}

export type ThemeInstanceMethods = JsonApiInstanceMethods

export type ThemeQueryHelper = JsonApiQueryHelper

export type ThemeModel = Model<ITheme, ThemeQueryHelper, ThemeInstanceMethods> & JsonApiModel<ITheme>

export const ThemeSchema = new Schema<ITheme, ThemeModel, ThemeInstanceMethods, ThemeQueryHelper>({
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

ThemeSchema.virtual("animes", {
  ref: "Anime",
  localField: "_id",
  foreignField: "themes",
});

ThemeSchema.virtual("mangas", {
  ref: "Manga",
  localField: "_id",
  foreignField: "themes",
});


ThemeSchema.plugin(MongooseJsonApi, {
  type: "themes",
});


export type TTheme = HydratedDocument<ITheme, ThemeInstanceMethods, ThemeQueryHelper>;

const Theme = model<ITheme, ThemeModel>("Theme", ThemeSchema);
export default Theme;
