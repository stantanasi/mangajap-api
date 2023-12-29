import { HydratedDocument, model, Model, Schema, Types } from 'mongoose';
import MongooseJsonApi, { JsonApiInstanceMethods, JsonApiModel, JsonApiQueryHelper } from '../utils/mongoose-jsonapi/mongoose-jsonapi';
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

export interface GenreInstanceMethods extends JsonApiInstanceMethods {
}

export interface GenreQueryHelper extends JsonApiQueryHelper {
}

export interface GenreModel extends Model<IGenre, GenreQueryHelper, GenreInstanceMethods> {
}

export const GenreSchema = new Schema<IGenre, GenreModel & JsonApiModel<IGenre>, GenreInstanceMethods, GenreQueryHelper>({
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


GenreSchema.plugin(MongooseJsonApi, {
  type: 'genres',
});


export type TGenre = HydratedDocument<IGenre, GenreInstanceMethods, GenreQueryHelper>

const Genre = model<IGenre, GenreModel & JsonApiModel<IGenre>>('Genre', GenreSchema);
export default Genre;
