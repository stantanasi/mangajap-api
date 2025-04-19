import MongooseJsonApi, { JsonApiInstanceMethods, JsonApiModel, JsonApiQueryHelper } from "@stantanasi/mongoose-jsonapi";
import { HydratedDocument, model, Model, Schema, Types } from "mongoose";
import { deleteFile, uploadFile } from "../firebase-app";
import MongooseMultiLanguage, { MultiLanguageInstanceMethods, MultiLanguageModel, MultiLanguageQueryHelper } from "../utils/mongoose-multi-language/mongoose-multi-language";
import { TAnime } from "./anime.model";
import Episode, { TEpisode } from "./episode.model";

export interface ISeason {
  _id: Types.ObjectId;

  number: number;
  title: Map<string, string>;
  overview: Map<string, string>;
  poster: Map<string, string | null>;

  airDate: Map<string, Date | null>;
  episodeCount: number;

  anime: Types.ObjectId | TAnime;
  episodes?: TEpisode[];

  createdAt: Date;
  updatedAt: Date;
}

export type SeasonInstanceMethods = MultiLanguageInstanceMethods & JsonApiInstanceMethods

export type SeasonQueryHelper = MultiLanguageQueryHelper & JsonApiQueryHelper

export type SeasonModel = Model<ISeason, SeasonQueryHelper, SeasonInstanceMethods> & MultiLanguageModel<ISeason> & JsonApiModel<ISeason>

export const SeasonSchema = new Schema<ISeason, SeasonModel, SeasonInstanceMethods, SeasonQueryHelper>({
  number: {
    type: Number,
    required: true,
  },

  title: {
    type: Map,
    of: String,
    default: {},
  },

  overview: {
    type: Map,
    of: String,
    default: {},
  },

  poster: {
    type: Map,
    of: String,
    default: {},
  },


  airDate: {
    type: Map,
    of: Date,
    default: {},
    transform: function (this, val: ISeason['airDate']) {
      return Object.fromEntries(
        Array.from(val.entries()).map(([key, value]) => [key, value?.toISOString().slice(0, 10) ?? null])
      );
    },
  },

  episodeCount: {
    type: Number,
    default: 0,
  },


  anime: {
    type: Schema.Types.ObjectId,
    ref: "Anime",
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

SeasonSchema.virtual("episodes", {
  ref: "Episode",
  localField: "_id",
  foreignField: "season",
  options: {
    sort: { number: 1 },
  },
});

SeasonSchema.index({
  number: 1,
  anime: 1,
}, { unique: true });


SeasonSchema.pre<TSeason>("save", async function () {
  if (this.isModified("poster.fr-FR")) {
    this.poster.set('fr-FR', await uploadFile(
      `anime/${this.anime}/seasons/${this._id}/images/poster.jpg`,
      this.poster.get('fr-FR') ?? null,
    ));
  }
});

SeasonSchema.pre("findOne", async function () {
  const _id = this.getFilter()._id;
  if (!_id) return;

  await Season.findOneAndUpdate(this.getFilter(), {
    airDate: await Episode.findOne({
      season: _id,
    }).sort({ number: 1 }).then((doc) => doc?.airDate ?? {}),

    episodeCount: await Episode.countDocuments({
      season: _id,
    }),
  });
});

SeasonSchema.pre<TSeason>("deleteOne", async function () {
  if (this.poster.get('fr-FR')) {
    await deleteFile(
      `anime/${this.anime}/seasons/${this._id}/images/poster.jpg`,
    );
  }
});


SeasonSchema.plugin(MongooseMultiLanguage, {
  fields: ["title", "overview", "airDate", "poster"],
});

SeasonSchema.plugin(MongooseJsonApi, {
  type: "seasons",
});


export type TSeason = HydratedDocument<ISeason, SeasonInstanceMethods, SeasonQueryHelper>;

const Season = model<ISeason, SeasonModel>("Season", SeasonSchema);
export default Season;
