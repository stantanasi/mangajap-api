import MongooseJsonApi, { JsonApiInstanceMethods, JsonApiModel, JsonApiQueryHelper } from "@stantanasi/mongoose-jsonapi";
import { HydratedDocument, model, Model, Schema, Types } from "mongoose";
import MongooseChangeTracking, { ChangeTrackingInstanceMethods, ChangeTrackingModel, ChangeTrackingQueryHelper } from "../utils/mongoose-change-tracking/mongoose-change-tracking";
import MongooseMultiLanguage, { MultiLanguageInstanceMethods, MultiLanguageModel, MultiLanguageQueryHelper } from "../utils/mongoose-multi-language/mongoose-multi-language";
import Anime, { TAnime } from "./anime.model";
import { TChange } from "./change.model";
import Manga, { TManga } from "./manga.model";

enum FranchiseRole {
  Adaptation = "adaptation",
  AlternativeSetting = "alternative_setting",
  AlternativeVersion = "alternative_version",
  Character = "character",
  FullStory = "full_story",
  Other = "other",
  ParentStory = "parent_story",
  Prequel = "prequel",
  Sequel = "sequel",
  SideStory = "side_story",
  Spinoff = "spinoff",
  Summary = "summary",
}

export interface IFranchise {
  _id: Types.ObjectId;

  role: FranchiseRole;
  sourceModel: "Anime" | "Manga";
  destinationModel: "Anime" | "Manga";

  source: Types.ObjectId | (TAnime | TManga);
  destination: Types.ObjectId | (TAnime | TManga);
  changes?: TChange[];

  createdAt: Date;
  updatedAt: Date;
}

export type FranchiseInstanceMethods = MultiLanguageInstanceMethods & JsonApiInstanceMethods & ChangeTrackingInstanceMethods

export type FranchiseQueryHelper = MultiLanguageQueryHelper & JsonApiQueryHelper & ChangeTrackingQueryHelper

export type FranchiseModel = Model<IFranchise, FranchiseQueryHelper, FranchiseInstanceMethods> & MultiLanguageModel<IFranchise> & JsonApiModel<IFranchise> & ChangeTrackingModel<IFranchise>

export const FranchiseSchema = new Schema<IFranchise, FranchiseModel, FranchiseInstanceMethods, FranchiseQueryHelper>({
  role: {
    type: String,
    required: true,
    enum: Object.values(FranchiseRole),
  },

  sourceModel: {
    type: String,
    required: true,
    enum: ["Anime", "Manga"],
  },

  destinationModel: {
    type: String,
    required: true,
    enum: ["Anime", "Manga"],
  },


  source: {
    type: Schema.Types.ObjectId,
    refPath: "sourceModel",
    required: true,
  },

  destination: {
    type: Schema.Types.ObjectId,
    refPath: "destinationModel",
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

FranchiseSchema.virtual("changes", {
  ref: "Change",
  localField: "_id",
  foreignField: "document",
});


FranchiseSchema.pre<TFranchise>("validate", async function () {
  if (!this.sourceModel && this.source) {
    if (await Anime.exists({ _id: this.source }))
      this.sourceModel = "Anime";
    else if (await Manga.exists({ _id: this.source }))
      this.sourceModel = "Manga";
  }

  if (!this.destinationModel && this.destination) {
    if (await Anime.exists({ _id: this.destination }))
      this.destinationModel = "Anime";
    else if (await Manga.exists({ _id: this.destination }))
      this.destinationModel = "Manga";
  }
});


FranchiseSchema.plugin(MongooseMultiLanguage, {
  fields: [],
});

FranchiseSchema.plugin(MongooseJsonApi, {
  type: "franchises",
});

FranchiseSchema.plugin(MongooseChangeTracking);


export type TFranchise = HydratedDocument<IFranchise, FranchiseInstanceMethods, FranchiseQueryHelper>;

const Franchise = model<IFranchise, FranchiseModel>("Franchise", FranchiseSchema);
export default Franchise;
