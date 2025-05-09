import MongooseJsonApi, { JsonApiInstanceMethods, JsonApiModel, JsonApiQueryHelper } from '@stantanasi/mongoose-jsonapi';
import { HydratedDocument, model, Model, Schema, Types } from 'mongoose';
import MongooseChangeTracking, { ChangeTrackingInstanceMethods, ChangeTrackingModel, ChangeTrackingQueryHelper } from '../utils/mongoose-change-tracking/mongoose-change-tracking';
import MongooseMultiLanguage, { MultiLanguageInstanceMethods, MultiLanguageModel, MultiLanguageQueryHelper } from '../utils/mongoose-multi-language/mongoose-multi-language';
import { TAnime } from './anime.model';
import { TChange } from './change.model';
import { TManga } from './manga.model';

export interface ITheme {
  _id: Types.ObjectId;

  name: Map<string, string>;

  animes?: TAnime[];
  mangas?: TManga[];
  changes?: TChange[];

  createdAt: Date;
  updatedAt: Date;
}

export type ThemeInstanceMethods = MultiLanguageInstanceMethods & JsonApiInstanceMethods & ChangeTrackingInstanceMethods

export type ThemeQueryHelper = MultiLanguageQueryHelper & JsonApiQueryHelper & ChangeTrackingQueryHelper

export type ThemeModel = Model<ITheme, ThemeQueryHelper, ThemeInstanceMethods> & MultiLanguageModel<ITheme> & JsonApiModel<ITheme> & ChangeTrackingModel<ITheme>

export const ThemeSchema = new Schema<ITheme, ThemeModel, ThemeInstanceMethods, ThemeQueryHelper>({
  name: {
    type: Map,
    of: String,
    default: {},
    validate: {
      validator: function (value: ITheme['name']) {
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

ThemeSchema.virtual('changes', {
  ref: 'Change',
  localField: '_id',
  foreignField: 'document',
});


ThemeSchema.plugin(MongooseMultiLanguage, {
  fields: ['name'],
});

ThemeSchema.plugin(MongooseJsonApi, {
  type: 'themes',
});

ThemeSchema.plugin(MongooseChangeTracking);


export type TTheme = HydratedDocument<ITheme, ThemeInstanceMethods, ThemeQueryHelper>;

const Theme = model<ITheme, ThemeModel>('Theme', ThemeSchema);
export default Theme;
