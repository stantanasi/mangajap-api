import MongooseJsonApi, { JsonApiInstanceMethods, JsonApiModel, JsonApiQueryHelper } from "@stantanasi/mongoose-jsonapi";
import { HydratedDocument, model, Model, Schema, Types } from "mongoose";
import { deleteFile, uploadFile } from "../firebase-app";
import MongooseMultiLanguage, { MultiLanguageInstanceMethods, MultiLanguageModel, MultiLanguageQueryHelper } from "../utils/mongoose-multi-language/mongoose-multi-language";
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

  title: Map<string, string>;
  overview: Map<string, string>;
  startDate: Map<string, Date>;
  endDate: Map<string, Date | null>;
  origin: string[];
  mangaType: MangaType;
  status: MangaStatus;
  poster: Map<string, string | null>;
  banner: Map<string, string | null>;
  links: Map<string, string>;

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

export type MangaInstanceMethods = MultiLanguageInstanceMethods & SearchInstanceMethods & JsonApiInstanceMethods;

export type MangaQueryHelper = MultiLanguageQueryHelper & SearchQueryHelper & JsonApiQueryHelper;

export type MangaModel = Model<IManga, MangaQueryHelper, MangaInstanceMethods> & MultiLanguageModel<IManga> & SearchModel<IManga> & JsonApiModel<IManga>;

export const MangaSchema = new Schema<IManga, MangaModel, MangaInstanceMethods, MangaQueryHelper>({
  title: {
    type: Map,
    of: String,
    default: {},
    validate: {
      validator: function (value: IManga['title']) {
        return value.size > 0 && Array.from(value.values()).every((v) => !!v);
      },
      message: 'Invalid title',
    },
  },

  overview: {
    type: Map,
    of: String,
    default: {},
    validate: {
      validator: function (value: IManga['overview']) {
        return value.size > 0 && Array.from(value.values()).every((v) => !!v);
      },
      message: 'Invalid overview',
    },
  },

  startDate: {
    type: Map,
    of: Date,
    default: {},
    validate: {
      validator: function (value: IManga['startDate']) {
        return value.size > 0 && Array.from(value.values()).every((v) => !!v);
      },
      message: 'Invalid startDate',
    },
    transform: function (this, val: IManga['startDate']) {
      return Object.fromEntries(
        Array.from(val.entries()).map(([key, value]) => [key, value?.toISOString().slice(0, 10) ?? null])
      );
    },
  },

  endDate: {
    type: Map,
    of: Date,
    default: {},
    transform: function (this, val: IManga['endDate']) {
      return Object.fromEntries(
        Array.from(val.entries()).map(([key, value]) => [key, value?.toISOString().slice(0, 10) ?? null])
      );
    },
  },

  origin: {
    type: [String],
    default: [],
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

  poster: {
    type: Map,
    of: String,
    default: {},
  },

  banner: {
    type: Map,
    of: String,
    default: {},
  },

  links: {
    type: Map,
    of: String,
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


MangaSchema.pre<TManga>("save", async function () {
  if (this.isModified("poster.fr-FR")) {
    this.poster.set('fr-FR', await uploadFile(
      `manga/${this._id}/images/cover.jpg`,
      this.poster.get('fr-FR') ?? null,
    ));
  }

  if (this.isModified("banner.fr-FR")) {
    this.banner.set('fr-FR', await uploadFile(
      `manga/${this._id}/images/banner.jpg`,
      this.banner.get('fr-FR') ?? null,
    ));
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
      .then((doc) => doc?.popularity ?? 0),
  });
});

MangaSchema.pre<TManga>("deleteOne", async function () {
  if (this.poster.get('fr-FR')) {
    await deleteFile(
      `manga/${this._id}/images/cover.jpg`,
    );
  }

  if (this.banner.get('fr-FR')) {
    await deleteFile(
      `manga/${this._id}/images/banner.jpg`,
    );
  }
});


MangaSchema.plugin(MongooseMultiLanguage, {
  fields: ["title", "overview", "startDate", "endDate", "poster", "banner"],
});

MangaSchema.plugin(MongooseSearch, {
  fields: ["title"],
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
