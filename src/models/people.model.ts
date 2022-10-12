import { Schema, model, Model, Document, Types } from 'mongoose';
import { ref } from 'firebase/storage';
import { storage, uploadFile } from '../firebase-app';
import MongooseJsonApi, { JsonApiInstanceMethods, JsonApiModel, JsonApiQueryHelper } from '../utils/mongoose-jsonapi/mongoose-jsonapi';
import { IStaff } from "./staff.model";
import MongooseSearch, { SearchInstanceMethods, SearchModel, SearchQueryHelper } from '../utils/mongoose-search/mongoose-search';

export interface IPeople {
  _id: Types.ObjectId;

  firstName: string;
  lastName: string;
  pseudo: string;
  image: string | null;

  staff?: IStaff[];
  'anime-staff'?: IStaff[];
  'manga-staff'?: IStaff[];

  createdAt: Date;
  updatedAt: Date;
}

export interface PeopleInstanceMethods extends Document, JsonApiInstanceMethods, SearchInstanceMethods {
}

export interface PeopleQueryHelper extends JsonApiQueryHelper, SearchQueryHelper {
}

export interface PeopleModel extends Model<IPeople, PeopleQueryHelper, PeopleInstanceMethods> {
}

export const PeopleSchema = new Schema<IPeople, PeopleModel & JsonApiModel<IPeople> & SearchModel<IPeople>, PeopleInstanceMethods, PeopleQueryHelper>({
  firstName: {
    type: String,
    default: ''
  },

  lastName: {
    type: String,
    default: ''
  },

  pseudo: {
    type: String,
    default: ''
  },

  image: {
    type: String,
    default: null,
  },
}, {
  id: false,
  versionKey: false,
  timestamps: true,
  minimize: false,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

PeopleSchema.virtual('staff', {
  ref: 'Staff',
  localField: '_id',
  foreignField: 'people'
});

PeopleSchema.virtual('anime-staff', {
  ref: 'Staff',
  localField: '_id',
  foreignField: 'people',
  match: {
    anime: { $exists: true, $ne: null }
  }
});

PeopleSchema.virtual('manga-staff', {
  ref: 'Staff',
  localField: '_id',
  foreignField: 'people',
  match: {
    manga: { $exists: true, $ne: null }
  }
});


PeopleSchema.pre<IPeople & Document>('save', async function () {
  if (this.isModified('image')) {
    this.image = await uploadFile(
      ref(storage, `peoples/${this._id}/images/profile.jpg`),
      this.image,
    );
  }
});


PeopleSchema.plugin(MongooseSearch, {
  fields: ['firstName', 'lastName', 'pseudo'],
});

PeopleSchema.plugin(MongooseJsonApi, {
  type: 'peoples',
  filter: {
    query: (query: string) => {
      return {
        $search: query,
      };
    }
  },
});


const People = model<IPeople, PeopleModel & JsonApiModel<IPeople> & SearchModel<IPeople>>('People', PeopleSchema);
export default People;
