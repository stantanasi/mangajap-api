import MongooseJsonApi, { JsonApiInstanceMethods, JsonApiModel, JsonApiQueryHelper } from "@stantanasi/mongoose-jsonapi";
import { HydratedDocument, model, Model, Schema, Types } from "mongoose";
import MongooseMultiLanguage, { MultiLanguageInstanceMethods, MultiLanguageModel, MultiLanguageQueryHelper } from "../utils/mongoose-multi-language/mongoose-multi-language";
import { TAnime } from "./anime.model";
import { TManga } from "./manga.model";
import { TPeople } from "./people.model";

enum StaffRole {
  Author = "author",
  Illustrator = "illustrator",
  StoryAndArt = "story_and_art",
  Licensor = "licensor",
  Producer = "producer",
  Studio = "studio",
  OriginalCreator = "original_creator",
}

export interface IStaff {
  _id: Types.ObjectId;

  role: StaffRole;

  people: Types.ObjectId | TPeople;
  anime?: Types.ObjectId | TAnime;
  manga?: Types.ObjectId | TManga;

  createdAt: Date;
  updatedAt: Date;
}

export type StaffInstanceMethods = MultiLanguageInstanceMethods & JsonApiInstanceMethods

export type StaffQueryHelper = MultiLanguageQueryHelper & JsonApiQueryHelper

export type StaffModel = Model<IStaff, StaffQueryHelper, StaffInstanceMethods> & MultiLanguageModel<IStaff> & JsonApiModel<IStaff>

export const StaffSchema = new Schema<IStaff, StaffModel, StaffInstanceMethods, StaffQueryHelper>({
  role: {
    type: String,
    required: true,
    enum: Object.values(StaffRole),
  },


  people: {
    type: Schema.Types.ObjectId,
    ref: "People",
    required: true,
  },

  anime: {
    type: Schema.Types.ObjectId,
    ref: "Anime",
    default: undefined,
  },

  manga: {
    type: Schema.Types.ObjectId,
    ref: "Manga",
    default: undefined,
  },
}, {
  id: false,
  versionKey: false,
  timestamps: true,
  minimize: false,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});


StaffSchema.plugin(MongooseMultiLanguage, {
  fields: [],
});

StaffSchema.plugin(MongooseJsonApi, {
  type: "staff",
});


export type TStaff = HydratedDocument<IStaff, StaffInstanceMethods, StaffQueryHelper>;

const Staff = model<IStaff, StaffModel>("Staff", StaffSchema);
export default Staff;
