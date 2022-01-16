import { Schema, model, Types } from 'mongoose';
import JsonApiSerializer from "../utils/mongoose-jsonapi/jsonapi-serializer";
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

export const GenreSchema = new Schema<IGenre>({
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


const Genre = model<IGenre>('Genre', GenreSchema);
export default Genre;


JsonApiSerializer.register('genres', Genre);
