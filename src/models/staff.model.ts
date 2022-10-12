import { Schema, model, Model, Types } from 'mongoose';
import MongooseJsonApi, { JsonApiInstanceMethods, JsonApiModel, JsonApiQueryHelper } from '../utils/mongoose-jsonapi/mongoose-jsonapi';
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

export interface StaffInstanceMethods extends Document, JsonApiInstanceMethods {
}

export interface StaffQueryHelper extends JsonApiQueryHelper {
}

export interface StaffModel extends Model<IStaff, StaffQueryHelper, StaffInstanceMethods> {
}

export const StaffSchema = new Schema<IStaff, StaffModel & JsonApiModel<IStaff>, StaffInstanceMethods, StaffQueryHelper>({
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
  minimize: false,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});


StaffSchema.plugin(MongooseJsonApi, {
  type: 'staff',
});


const Staff = model<IStaff, StaffModel & JsonApiModel<IStaff>>('Staff', StaffSchema);
export default Staff;
