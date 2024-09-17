import { HydratedDocument, model, Model, Schema, Types } from "mongoose";
import MongooseJsonApi, { JsonApiInstanceMethods, JsonApiModel, JsonApiQueryHelper } from "../utils/mongoose-jsonapi/mongoose-jsonapi";
import Anime, { TAnime } from "./anime.model";
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

  source: Types.ObjectId | (TAnime | TManga);
  destination: Types.ObjectId | (TAnime | TManga);

  sourceModel: "Anime" | "Manga";
  destinationModel: "Anime" | "Manga";

  createdAt: Date;
  updatedAt: Date;
}

export type FranchiseInstanceMethods = JsonApiInstanceMethods

export type FranchiseQueryHelper = JsonApiQueryHelper

export type FranchiseModel = Model<IFranchise, FranchiseQueryHelper, FranchiseInstanceMethods> & JsonApiModel<IFranchise>

export const FranchiseSchema = new Schema<IFranchise, FranchiseModel, FranchiseInstanceMethods, FranchiseQueryHelper>({
  role: {
    type: String,
    required: true,
    enum: Object.values(FranchiseRole),
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
}, {
  id: false,
  versionKey: false,
  timestamps: true,
  minimize: false,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
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


FranchiseSchema.plugin(MongooseJsonApi, {
  type: "franchises",
});


export type TFranchise = HydratedDocument<IFranchise, FranchiseInstanceMethods, FranchiseQueryHelper>;

const Franchise = model<IFranchise, FranchiseModel>("Franchise", FranchiseSchema);
export default Franchise;
