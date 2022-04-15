import { Schema, model, Types } from 'mongoose';
import JsonApiSerializer from "../utils/mongoose-jsonapi/jsonapi-serializer";
import MongooseJsonApi, { JsonApiModel } from '../utils/mongoose-jsonapi/mongoose-jsonapi';
import { IAnime } from "./anime.model";
import { IManga } from "./manga.model";

export interface ITheme {
  _id: Types.ObjectId;

  title: string;
  description: string;

  animes?: IAnime[];
  mangas?: IManga[];

  createdAt: Date;
  updatedAt: Date;
}

export interface IThemeModel extends JsonApiModel<ITheme> {
}

export const ThemeSchema = new Schema<ITheme, IThemeModel>({
  title: {
    type: String,
    required: true
  },

  description: {
    type: String,
    default: '',
  },
}, {
  id: false,
  versionKey: false,
  timestamps: true,
  minimize: false,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

ThemeSchema.virtual('animes', {
  ref: 'Anime',
  localField: '_id',
  foreignField: 'themes',
});

ThemeSchema.virtual('mangas', {
  ref: 'Manga',
  localField: '_id',
  foreignField: 'themes',
});


ThemeSchema.plugin(MongooseJsonApi, {
  type: 'themes',
});


const Theme = model<ITheme, IThemeModel>('Theme', ThemeSchema);
export default Theme;


JsonApiSerializer.register('themes', Theme);
