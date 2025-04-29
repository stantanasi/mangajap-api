import MongooseJsonApi, { JsonApiInstanceMethods, JsonApiModel, JsonApiQueryHelper } from "@stantanasi/mongoose-jsonapi";
import { HydratedDocument, model, Model, Schema, Types } from "mongoose";
import MongooseMultiLanguage, { MultiLanguageInstanceMethods, MultiLanguageModel, MultiLanguageQueryHelper } from "../utils/mongoose-multi-language/mongoose-multi-language";
import { TAnime } from "./anime.model";
import { TChapter } from "./chapter.model";
import { TEpisode } from "./episode.model";
import { TFranchise } from "./franchise.model";
import { TGenre } from "./genre.model";
import { TUser } from "./user.model";

export interface IChange {
  _id: Types.ObjectId;

  action: "create" | "update" | "delete";
  changes: {
    before?: Record<string, any>;
    after?: Record<string, any>;
  };

  document: Types.ObjectId | (TAnime | TChapter | TEpisode | TFranchise | TGenre);
  documentModel: string;
  user: string | TUser;

  createdAt: Date;
  updatedAt: Date;
}

export type ChangeInstanceMethods = MultiLanguageInstanceMethods & JsonApiInstanceMethods

export type ChangeQueryHelper = MultiLanguageQueryHelper & JsonApiQueryHelper

export type ChangeModel = Model<IChange, ChangeQueryHelper, ChangeInstanceMethods> & MultiLanguageModel<IChange> & JsonApiModel<IChange>

export const ChangeSchema = new Schema<IChange, ChangeModel, ChangeInstanceMethods, ChangeQueryHelper>({
  action: {
    type: String,
    required: true,
    enum: ["create", "update", "delete"],
  },

  changes: {
    type: Schema.Types.Mixed,
    required: true,
  },


  document: {
    type: Schema.Types.ObjectId,
    refPath: "documentModel",
    required: true,
  },

  documentModel: {
    type: String,
    required: true,
    enum: ["Anime", "Chapter", "Episode", "Franchise", "Genre"],
  },

  user: {
    type: String,
    ref: "User",
    required: true,
  },
}, {
  id: false,
  versionKey: false,
  timestamps: true,
  minimize: false,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});


ChangeSchema.plugin(MongooseMultiLanguage, {
  fields: [],
});

ChangeSchema.plugin(MongooseJsonApi, {
  type: "changes",
});


export type TChange = HydratedDocument<IChange, ChangeInstanceMethods, ChangeQueryHelper>;

const Change = model<IChange, ChangeModel>("Change", ChangeSchema);
export default Change;
