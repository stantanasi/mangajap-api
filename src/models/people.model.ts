import MongooseJsonApi, { JsonApiInstanceMethods, JsonApiModel, JsonApiQueryHelper } from "@stantanasi/mongoose-jsonapi";
import { HydratedDocument, model, Model, Schema, Types } from "mongoose";
import { deleteFile, uploadFile } from "../firebase-app";
import MongooseMultiLanguage, { MultiLanguageInstanceMethods, MultiLanguageModel, MultiLanguageQueryHelper } from "../utils/mongoose-multi-language/mongoose-multi-language";
import MongooseSearch, { SearchInstanceMethods, SearchModel, SearchQueryHelper } from "../utils/mongoose-search/mongoose-search";
import { TStaff } from "./staff.model";

export interface IPeople {
  _id: Types.ObjectId;

  name: Map<string, string>;
  portrait: string | null;

  staff?: TStaff[];
  "anime-staff"?: TStaff[];
  "manga-staff"?: TStaff[];

  createdAt: Date;
  updatedAt: Date;
}

export type PeopleInstanceMethods = MultiLanguageInstanceMethods & SearchInstanceMethods & JsonApiInstanceMethods

export type PeopleQueryHelper = MultiLanguageQueryHelper & SearchQueryHelper & JsonApiQueryHelper

export type PeopleModel = Model<IPeople, PeopleQueryHelper, PeopleInstanceMethods> & MultiLanguageModel<IPeople> & SearchModel<IPeople> & JsonApiModel<IPeople>

export const PeopleSchema = new Schema<IPeople, PeopleModel, PeopleInstanceMethods, PeopleQueryHelper>({
  name: {
    type: Map,
    of: String,
    default: {},
    validate: {
      validator: function (value: IPeople['name']) {
        return value.size > 0 && Array.from(value.values()).every((v) => !!v);
      },
      message: 'Invalid name',
    },
  },

  portrait: {
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

PeopleSchema.virtual("staff", {
  ref: "Staff",
  localField: "_id",
  foreignField: "people",
});

PeopleSchema.virtual("anime-staff", {
  ref: "Staff",
  localField: "_id",
  foreignField: "people",
  match: {
    anime: { $exists: true, $ne: null },
  },
});

PeopleSchema.virtual("manga-staff", {
  ref: "Staff",
  localField: "_id",
  foreignField: "people",
  match: {
    manga: { $exists: true, $ne: null },
  },
});


PeopleSchema.pre<TPeople>("save", async function () {
  if (this.isModified("portrait")) {
    this.portrait = await uploadFile(
      `peoples/${this._id}/images/profile.jpg`,
      this.portrait,
    );
  }
});

PeopleSchema.pre<TPeople>("deleteOne", async function () {
  if (this.portrait) {
    await deleteFile(
      `peoples/${this._id}/images/profile.jpg`,
    );
  }
});


PeopleSchema.plugin(MongooseMultiLanguage, {
  fields: ["name"],
});

PeopleSchema.plugin(MongooseSearch, {
  fields: ["name"],
});

PeopleSchema.plugin(MongooseJsonApi, {
  type: "peoples",
  filter: {
    query: (query: string) => {
      return {
        $search: query,
      };
    },
  },
});


export type TPeople = HydratedDocument<IPeople, PeopleInstanceMethods, PeopleQueryHelper>;

const People = model<IPeople, PeopleModel>("People", PeopleSchema);
export default People;
