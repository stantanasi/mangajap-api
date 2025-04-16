import MongooseJsonApi, { JsonApiInstanceMethods, JsonApiModel, JsonApiQueryHelper } from "@stantanasi/mongoose-jsonapi";
import { HydratedDocument, model, Model, Schema, Types } from "mongoose";
import { deleteFile, uploadFile } from "../firebase-app";
import MongooseMultiLanguage, { MultiLanguageInstanceMethods, MultiLanguageModel, MultiLanguageQueryHelper } from "../utils/mongoose-multi-language/mongoose-multi-language";
import { TAnime } from "./anime.model";
import { TEpisodeEntry } from "./episode-entry.model";
import { TSeason } from "./season.model";

enum EpisodeType {
  None = "",
  Oav = "oav",
}

export interface IEpisode {
  _id: Types.ObjectId;

  number: number;
  title: Map<string, string>;
  overview: Map<string, string>;
  airDate: Map<string, Date | null>;
  runtime: number;
  episodeType: EpisodeType;
  poster: Map<string, string | null>;

  anime: Types.ObjectId | TAnime;
  season: Types.ObjectId | TSeason;
  "episode-entry"?: TEpisodeEntry | null;

  createdAt: Date;
  updatedAt: Date;
}

export type EpisodeInstanceMethods = MultiLanguageInstanceMethods & JsonApiInstanceMethods

export type EpisodeQueryHelper = MultiLanguageQueryHelper & JsonApiQueryHelper

export type EpisodeModel = Model<IEpisode, EpisodeQueryHelper, EpisodeInstanceMethods> & MultiLanguageModel<IEpisode> & JsonApiModel<IEpisode>

export const EpisodeSchema = new Schema<IEpisode, EpisodeModel, EpisodeInstanceMethods, EpisodeQueryHelper>({
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

  airDate: {
    type: Map,
    of: Date,
    default: {},
    transform: function (this, val: IEpisode['airDate']) {
      return Object.fromEntries(
        Array.from(val.entries()).map(([key, value]) => [key, value?.toISOString().slice(0, 10) ?? null])
      );
    },
  },

  runtime: {
    type: Number,
    default: 0,
  },

  episodeType: {
    type: String,
    enum: Object.values(EpisodeType),
    default: EpisodeType.None,
  },

  poster: {
    type: Map,
    of: String,
    default: {},
  },


  anime: {
    type: Schema.Types.ObjectId,
    ref: "Anime",
    required: true,
  },

  season: {
    type: Schema.Types.ObjectId,
    ref: "Season",
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

EpisodeSchema.virtual("episode-entry");

EpisodeSchema.index({
  number: 1,
  season: 1,
}, { unique: true });


EpisodeSchema.pre<TEpisode>("save", async function () {
  if (this.isModified("poster.fr-FR")) {
    this.poster.set('fr-FR', await uploadFile(
      `anime/${this.anime}/seasons/${this._id}/images/poster.jpg`,
      this.poster.get('fr-FR') ?? null,
    ));
  }
});

EpisodeSchema.pre<TEpisode>("deleteOne", async function () {
  if (this.poster.get('fr-FR')) {
    await deleteFile(
      `anime/${this.anime}/seasons/${this._id}/images/poster.jpg`,
    );
  }
});


EpisodeSchema.plugin(MongooseMultiLanguage, {
  fields: ["title", "overview", "airDate", "poster"],
});

EpisodeSchema.plugin(MongooseJsonApi, {
  type: "episodes",
});


export type TEpisode = HydratedDocument<IEpisode, EpisodeInstanceMethods, EpisodeQueryHelper>;

const Episode = model<IEpisode, EpisodeModel>("Episode", EpisodeSchema);
export default Episode;
