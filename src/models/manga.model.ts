import { HydratedDocument, model, Model, Schema, Types } from "mongoose";
import slugify from "slugify";
import { deleteFile, uploadFile } from "../firebase-app";
import MongooseJsonApi, { JsonApiInstanceMethods, JsonApiModel, JsonApiQueryHelper } from "../utils/mongoose-jsonapi/mongoose-jsonapi";
import MongooseSearch, { SearchInstanceMethods, SearchModel, SearchQueryHelper } from "../utils/mongoose-search/mongoose-search";
import Chapter, { TChapter } from "./chapter.model";
import { TFranchise } from "./franchise.model";
import { TGenre } from "./genre.model";
import MangaEntry, { TMangaEntry } from "./manga-entry.model";
import Review, { TReview } from "./review.model";
import { TStaff } from "./staff.model";
import { TTheme } from "./theme.model";
import Volume, { TVolume } from "./volume.model";

enum MangaType {
  Bd = "bd",
  Comics = "comics",
  Josei = "josei",
  Kodomo = "kodomo",
  Seijin = "seijin",
  Seinen = "seinen",
  Shojo = "shojo",
  Shonen = "shonen",
  Doujin = "doujin",
  Novel = "novel",
  Oneshot = "oneshot",
  Webtoon = "webtoon",
}

enum MangaStatus {
  Publishing = "publishing",
  Finished = "finished",
  Unreleased = "unreleased",
  Upcoming = "upcoming",
}

export interface IManga {
  _id: Types.ObjectId;

  title: string;
  titles: {
    [language: string]: string
  };
  slug: string;
  synopsis: string;
  startDate: Date;
  endDate: Date | null;
  origin: string;
  mangaType: MangaType;
  status: MangaStatus;
  coverImage: string | null;
  bannerImage: string | null;
  links: {
    [site: string]: string;
  };

  volumeCount: number;
  chapterCount: number;

  averageRating: number | null;
  ratingRank: number | null;
  popularity: number;
  userCount: number;
  favoritesCount: number;
  reviewCount: number;

  genres: Types.ObjectId[] | TGenre[];
  themes: Types.ObjectId[] | TTheme[];
  volumes?: TVolume[];
  chapters?: TChapter[];
  staff?: TStaff[];
  reviews?: TReview[];
  franchises?: TFranchise[];
  "manga-entry"?: TMangaEntry | null;

  createdAt: Date;
  updatedAt: Date;
}

export type MangaInstanceMethods = JsonApiInstanceMethods & SearchInstanceMethods

export type MangaQueryHelper = JsonApiQueryHelper & SearchQueryHelper

export type MangaModel = Model<IManga, MangaQueryHelper, MangaInstanceMethods> & JsonApiModel<IManga> & SearchModel<IManga>

export const MangaSchema = new Schema<IManga, MangaModel, MangaInstanceMethods, MangaQueryHelper>({
  title: {
    type: String,
    required: true,
  },

  titles: {
    type: Schema.Types.Mixed,
    default: {},
  },

  slug: {
    type: String,
    required: true,
    lowercase: true,
  },

  synopsis: {
    type: String,
    default: "",
  },

  startDate: {
    type: Date,
    required: true,
    transform: function (this, val: Date | undefined) {
      return val?.toISOString().slice(0, 10) ?? val;
    },
  },

  endDate: {
    type: Date,
    default: null,
    transform: function (this, val: Date | null | undefined) {
      return val?.toISOString().slice(0, 10) ?? val;
    },
  },

  origin: {
    type: String,
    default: "",
  },

  mangaType: {
    type: String,
    required: true,
    enum: Object.values(MangaType),
  },

  status: {
    type: String,
    required: true,
    enum: Object.values(MangaStatus),
  },

  coverImage: {
    type: String,
    default: null,
  },

  bannerImage: {
    type: String,
    default: null,
  },

  links: {
    type: Schema.Types.Mixed,
    default: {},
  },


  volumeCount: {
    type: Number,
    default: 0,
  },

  chapterCount: {
    type: Number,
    default: 0,
  },


  averageRating: {
    type: Number,
    default: null,
  },

  ratingRank: {
    type: Number,
    default: null,
  },

  popularity: {
    type: Number,
    default: 0,
  },

  userCount: {
    type: Number,
    default: 0,
  },

  favoritesCount: {
    type: Number,
    default: 0,
  },

  reviewCount: {
    type: Number,
    default: 0,
  },


  genres: [{
    type: Schema.Types.ObjectId,
    ref: "Genre",
    default: [],
  }],

  themes: [{
    type: Schema.Types.ObjectId,
    ref: "Theme",
    default: [],
  }],
}, {
  id: false,
  versionKey: false,
  timestamps: true,
  minimize: false,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

MangaSchema.virtual("volumes", {
  ref: "Volume",
  localField: "_id",
  foreignField: "manga",
  options: {
    sort: { number: 1 },
  },
});

MangaSchema.virtual("chapters", {
  ref: "Chapter",
  localField: "_id",
  foreignField: "manga",
  options: {
    sort: { number: 1 },
  },
});

MangaSchema.virtual("staff", {
  ref: "Staff",
  localField: "_id",
  foreignField: "manga",
});

MangaSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "manga",
  options: {
    sort: { updatedAt: -1 },
  },
});

MangaSchema.virtual("franchises", {
  ref: "Franchise",
  localField: "_id",
  foreignField: "source",
});

MangaSchema.virtual("manga-entry");


MangaSchema.pre<TManga>("validate", async function () {
  if (this.isModified("title")) {
    this.slug = slugify(this.title);
  }
});

MangaSchema.pre<TManga>("save", async function () {
  if (this.isModified("coverImage")) {
    this.coverImage = await uploadFile(
      `manga/${this._id}/images/cover.jpg`,
      this.coverImage,
    );
  }

  if (this.isModified("bannerImage")) {
    this.bannerImage = await uploadFile(
      `manga/${this._id}/images/banner.jpg`,
      this.bannerImage,
    );
  }
});

MangaSchema.pre("findOne", async function () {
  const _id = this.getFilter()._id;
  if (!_id) return;

  await Manga.findOneAndUpdate(this.getFilter(), {
    volumeCount: await Volume.countDocuments({
      manga: _id,
    }),

    chapterCount: await Chapter.countDocuments({
      manga: _id,
    }),

    averageRating: await MangaEntry.aggregate()
      .match({ manga: new Types.ObjectId(_id) })
      .group({
        _id: null,
        averageRating: { $avg: "$rating" },
      })
      .then((docs) => docs[0])
      .then((doc) => doc?.averageRating ?? null),

    userCount: await MangaEntry.countDocuments({
      manga: _id,
      isAdd: true,
    }),

    favoritesCount: await MangaEntry.countDocuments({
      manga: _id,
      isFavorites: true,
    }),

    reviewCount: await Review.countDocuments({
      manga: _id,
    }),

    popularity: await Manga.aggregate()
      .match({ _id: new Types.ObjectId(_id) })
      .lookup({
        from: "mangaentries",
        localField: "_id",
        foreignField: "manga",
        as: "entriesCount",
        pipeline: [
          {
            $match: {
              updatedAt: {
                $gte: new Date(new Date().setDate(new Date().getDate() - 7)),
              },
            },
          },
        ],
      })
      .addFields({ entriesCount: { $size: "$entriesCount" } })
      .addFields({
        popularity: {
          $add: [
            "$userCount", "$favoritesCount",
            { $multiply: ["$userCount", { $ifNull: ["$averageRating", 0] }] },
            { $multiply: [2, "$entriesCount", { $ifNull: ["$averageRating", 0] }, { $add: ["$userCount", "$favoritesCount"] }] },
          ],
        },
      })
      .then((docs) => docs[0])
      .then((doc) => doc?.popularity | 0 ?? 0),
  });
});

MangaSchema.pre<TManga>("deleteOne", async function () {
  if (this.coverImage) {
    await deleteFile(
      `manga/${this._id}/images/cover.jpg`,
    );
  }

  if (this.bannerImage) {
    await deleteFile(
      `manga/${this._id}/images/banner.jpg`,
    );
  }
});


MangaSchema.plugin(MongooseSearch, {
  fields: ["title", "titles"],
});

MangaSchema.plugin(MongooseJsonApi, {
  type: "manga",
  filter: {
    query: (query: string) => {
      return {
        $search: query,
      };
    },
  },
});


export type TManga = HydratedDocument<IManga, MangaInstanceMethods, MangaQueryHelper>;

const Manga = model<IManga, MangaModel>("Manga", MangaSchema);
export default Manga;
