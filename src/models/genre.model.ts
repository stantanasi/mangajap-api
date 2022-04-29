import { Schema, model, Types } from 'mongoose';
import MongooseJsonApi, { JsonApiModel } from '../utils/mongoose-jsonapi/mongoose-jsonapi';
import { IAnime } from "./anime.model";
import { IManga } from "./manga.model";

export interface IGenre {
  _id: Types.ObjectId;

  title: string;
  description: string;

  animes?: IAnime[];
  mangas?: IManga[];

  createdAt: Date;
  updatedAt: Date;
}

export interface IGenreModel extends JsonApiModel<IGenre> {
}

export const GenreSchema = new Schema<IGenre, IGenreModel>({
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


const Genre = model<IGenre, IGenreModel>('Genre', GenreSchema);
export default Genre;
