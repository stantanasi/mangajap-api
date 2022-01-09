import { Schema, model, Types } from 'mongoose';
import JsonApiSerializer from "../utils/mongoose-jsonapi/jsonapi-serializer";
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

export const ThemeSchema = new Schema<ITheme>({
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


const Theme = model<ITheme>('Theme', ThemeSchema);
export default Theme;


JsonApiSerializer.register('themes', Theme);
