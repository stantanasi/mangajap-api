import { HydratedDocument, model, Model, Schema, Types } from "mongoose";
import { deleteFile, uploadFile } from "../firebase-app";
import MongooseJsonApi, { JsonApiInstanceMethods, JsonApiModel, JsonApiQueryHelper } from "../utils/mongoose-jsonapi/mongoose-jsonapi";
import { TAnime } from "./anime.model";
import Episode, { TEpisode } from "./episode.model";

export interface ISeason {
  _id: Types.ObjectId;

  titles: {
    [language: string]: string;
  };
  overview: string;
  number: number;
  posterImage: string | null;

  airDate: Date | null;
  episodeCount: number;

  anime: Types.ObjectId | TAnime;
  episodes?: TEpisode[];

  createdAt: Date;
  updatedAt: Date;
}

export interface SeasonInstanceMethods extends JsonApiInstanceMethods {
}

export interface SeasonQueryHelper extends JsonApiQueryHelper {
}

export interface SeasonModel extends Model<ISeason, SeasonQueryHelper, SeasonInstanceMethods> {
}

export const SeasonSchema = new Schema<ISeason, SeasonModel & JsonApiModel<ISeason>, SeasonInstanceMethods, SeasonQueryHelper>({
  titles: {
    type: Schema.Types.Mixed,
    default: {},
  },

  overview: {
    type: String,
    default: "",
  },

  number: {
    type: Number,
    required: true,
  },

  posterImage: {
    type: String,
    default: null,
  },


  airDate: {
    type: Date,
    default: null,
    transform: function (this, val: Date | null | undefined) {
      return val?.toISOString().slice(0, 10) ?? val;
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
  if (this.isModified("posterImage")) {
    this.posterImage = await uploadFile(
      `anime/${this.anime}/seasons/${this._id}/images/poster.jpg`,
      this.posterImage,
    );
  }
});

SeasonSchema.pre("findOne", async function () {
  const _id = this.getFilter()._id;
  if (!_id) return;

  await Season.findOneAndUpdate(this.getFilter(), {
    airDate: await Episode.findOne({
      season: _id,
    }).sort({ number: 1 }).then((doc) => doc?.airDate ?? null),

    episodeCount: await Episode.countDocuments({
      season: _id,
    }),
  });
});

SeasonSchema.pre<TSeason>("deleteOne", async function () {
  if (this.posterImage) {
    await deleteFile(
      `anime/${this.anime}/seasons/${this._id}/images/poster.jpg`,
    );
  }
});


SeasonSchema.plugin(MongooseJsonApi, {
  type: "seasons",
});


export type TSeason = HydratedDocument<ISeason, SeasonInstanceMethods, SeasonQueryHelper>;

const Season = model<ISeason, SeasonModel & JsonApiModel<ISeason>>("Season", SeasonSchema);
export default Season;
