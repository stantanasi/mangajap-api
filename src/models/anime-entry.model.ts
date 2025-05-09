import MongooseJsonApi, { JsonApiInstanceMethods, JsonApiModel, JsonApiQueryHelper } from '@stantanasi/mongoose-jsonapi';
import { HydratedDocument, model, Model, Schema, Types } from 'mongoose';
import MongooseMultiLanguage, { MultiLanguageInstanceMethods, MultiLanguageModel, MultiLanguageQueryHelper } from '../utils/mongoose-multi-language/mongoose-multi-language';
import Anime, { TAnime } from './anime.model';
import User, { TUser } from './user.model';

enum AnimeEntryStatus {
  Watching = 'watching',
  Completed = 'completed',
  Planned = 'planned',
  OnHold = 'on_hold',
  Dropped = 'dropped',
}

export interface IAnimeEntry {
  _id: Types.ObjectId;

  isAdd: boolean;
  isFavorites: boolean;
  status: AnimeEntryStatus;
  rating: number | null;

  episodesWatch: number;
  startedAt: Date | null;
  finishedAt: Date | null;

  user: string | TUser;
  anime: Types.ObjectId | TAnime;

  createdAt: Date;
  updatedAt: Date;
}

export type AnimeEntryInstanceMethods = MultiLanguageInstanceMethods & JsonApiInstanceMethods

export type AnimeEntryQueryHelper = MultiLanguageQueryHelper & JsonApiQueryHelper

export type AnimeEntryModel = Model<IAnimeEntry, AnimeEntryQueryHelper, AnimeEntryInstanceMethods> & MultiLanguageModel<IAnimeEntry> & JsonApiModel<IAnimeEntry> & {
  updateEpisodesWatch: (_id: Types.ObjectId) => Promise<void>;
}

export const AnimeEntrySchema = new Schema<IAnimeEntry, AnimeEntryModel, AnimeEntryInstanceMethods, AnimeEntryQueryHelper, {}, AnimeEntryModel>({
  isAdd: {
    type: Boolean,
    default: true,
  },

  isFavorites: {
    type: Boolean,
    default: false,
  },

  status: {
    type: String,
    default: AnimeEntryStatus.Watching,
    enum: Object.values(AnimeEntryStatus),
  },

  rating: {
    type: Number,
    default: null,
  },


  episodesWatch: {
    type: Number,
    default: 0,
  },

  startedAt: {
    type: Date,
    default: new Date(),
  },

  finishedAt: {
    type: Date,
    default: null,
  },


  user: {
    type: String,
    ref: 'User',
    required: true,
  },

  anime: {
    type: Schema.Types.ObjectId,
    ref: 'Anime',
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

AnimeEntrySchema.index({
  user: 1,
  anime: 1,
}, { unique: true });


AnimeEntrySchema.statics.updateEpisodesWatch = async function (_id) {
  await AnimeEntry.findByIdAndUpdate(_id, {
    episodesWatch: await AnimeEntry.aggregate()
      .match({ _id: _id })
      .lookup({
        from: 'animes',
        localField: 'anime',
        foreignField: '_id',
        as: 'anime',
        let: { user: '$user' },
        pipeline: [
          {
            $lookup: {
              from: 'episodes',
              localField: '_id',
              foreignField: 'anime',
              as: 'episodes',
              let: { user: '$$user' },
              pipeline: [
                {
                  $lookup: {
                    from: 'episodeentries',
                    localField: '_id',
                    foreignField: 'episode',
                    as: 'episode-entry',
                    pipeline: [
                      {
                        $match: {
                          $expr: {
                            $eq: ['$user', '$$user']
                          }
                        }
                      }
                    ]
                  }
                }
              ]
            }
          }
        ]
      })
      .unwind({ path: '$anime' })
      .unwind({ path: '$anime.episodes' })
      .unwind({ path: '$anime.episodes.episode-entry' })
      .group({
        _id: null,
        count: { $sum: 1 },
      })
      .then((result) => result[0].count),
  });
};


AnimeEntrySchema.post('save', async function () {
  await User.updateFollowedAnimeCount(typeof this.user === 'string' ? this.user : this.user._id);
  await User.updateTimeSpentOnAnime(typeof this.user === 'string' ? this.user : this.user._id);

  await Anime.updateAverageRating(this.anime._id);
  await Anime.updateUserCount(this.anime._id);
  await Anime.updateFavoritesCount(this.anime._id);
  await Anime.updatePopularity(this.anime._id);
});

AnimeEntrySchema.post('deleteOne', { document: true, query: false }, async function () {
  await User.updateFollowedAnimeCount(typeof this.user === 'string' ? this.user : this.user._id);
  await User.updateTimeSpentOnAnime(typeof this.user === 'string' ? this.user : this.user._id);

  await Anime.updateAverageRating(this.anime._id);
  await Anime.updateUserCount(this.anime._id);
  await Anime.updateFavoritesCount(this.anime._id);
  await Anime.updatePopularity(this.anime._id);
});


AnimeEntrySchema.plugin(MongooseMultiLanguage, {
  fields: [],
});

AnimeEntrySchema.plugin(MongooseJsonApi, {
  type: 'anime-entries',
});


export type TAnimeEntry = HydratedDocument<IAnimeEntry, AnimeEntryInstanceMethods, AnimeEntryQueryHelper>;

const AnimeEntry = model<IAnimeEntry, AnimeEntryModel>('AnimeEntry', AnimeEntrySchema);
export default AnimeEntry;
