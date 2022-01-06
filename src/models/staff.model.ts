import { Schema, model, Types } from 'mongoose';
import JsonApiSerializer from "../utils/mongoose-jsonapi/jsonapi-serializer";
import { IAnime } from "./anime.model";
import { IManga } from "./manga.model";
import { IPeople } from "./people.model";

export interface IStaff {
  _id: Types.ObjectId;

  role: 'author' | 'illustrator' | 'story_and_art' | 'licensor' | 'producer' | 'studio' | 'original_creator';

  people: Types.ObjectId & IPeople;
  anime?: Types.ObjectId & IAnime;
  manga?: Types.ObjectId & IManga;

  createdAt: Date;
  updatedAt: Date;
}

export const StaffSchema = new Schema<IStaff>({
  role: {
    type: String,
    required: true,
    enum: ['author', 'illustrator', 'story_and_art', 'licensor', 'producer', 'studio', 'original_creator']
  },


  people: {
    type: Schema.Types.ObjectId,
    ref: 'People',
    required: true
  },

  anime: {
    type: Schema.Types.ObjectId,
    ref: 'Anime',
    default: undefined
  },

  manga: {
    type: Schema.Types.ObjectId,
    ref: 'Manga',
    default: undefined
  },
}, {
  id: false,
  versionKey: false,
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});


export const Staff = model<IStaff>('Staff', StaffSchema);


JsonApiSerializer.register('staff', Staff);
