import MongooseJsonApi, { JsonApiInstanceMethods, JsonApiModel, JsonApiQueryHelper } from '@stantanasi/mongoose-jsonapi';
import { HydratedDocument, model, Model, Schema } from 'mongoose';
import { deleteFile, uploadFile } from '../firebase-app';
import MongooseMultiLanguage, { MultiLanguageInstanceMethods, MultiLanguageModel, MultiLanguageQueryHelper } from '../utils/mongoose-multi-language/mongoose-multi-language';
import MongooseSearch, { SearchInstanceMethods, SearchModel, SearchQueryHelper } from '../utils/mongoose-search/mongoose-search';
import AnimeEntry, { TAnimeEntry } from './anime-entry.model';
import Follow, { TFollow } from './follow.model';
import MangaEntry, { TMangaEntry } from './manga-entry.model';
import { TReview } from './review.model';

enum UserGender {
  Men = 'men',
  Women = 'women',
  Other = 'other',
}

export interface IUser {
  _id: string;

  pseudo: string;
  name: string;
  bio: string;
  gender: UserGender | null;
  birthday: Date | null;
  country: string;
  avatar: string | null;

  followersCount: number;
  followingCount: number;
  followedMangaCount: number;
  volumesRead: number;
  chaptersRead: number;
  followedAnimeCount: number;
  episodesWatch: number;
  timeSpentOnAnime: number;

  followers?: TFollow[];
  following?: TFollow[];
  'anime-library'?: TAnimeEntry[];
  'manga-library'?: TMangaEntry[];
  'anime-favorites'?: TAnimeEntry[];
  'manga-favorites'?: TMangaEntry[];
  reviews?: TReview[];

  createdAt: Date;
  updatedAt: Date;
}

export type UserInstanceMethods = MultiLanguageInstanceMethods & SearchInstanceMethods & JsonApiInstanceMethods

export type UserQueryHelper = MultiLanguageQueryHelper & SearchQueryHelper & JsonApiQueryHelper

export type UserModel = Model<IUser, UserQueryHelper, UserInstanceMethods> & MultiLanguageModel<IUser> & SearchModel<IUser> & JsonApiModel<IUser>

export const UserSchema = new Schema<IUser, UserModel, UserInstanceMethods, UserQueryHelper>({
  _id: {
    type: String,
    required: true,
  },


  pseudo: {
    type: String,
    required: true,
  },

  name: {
    type: String,
    default: '',
  },

  bio: {
    type: String,
    default: '',
  },

  gender: {
    type: String,
    default: null,
    enum: [...Object.values(UserGender), null],
  },

  birthday: {
    type: Date,
    default: null,
    transform: function (this, val: IUser['birthday']) {
      return val?.toISOString().slice(0, 10) ?? val;
    },
  },

  country: {
    type: String,
    default: '',
  },

  avatar: {
    type: String,
    default: null,
  },


  followersCount: {
    type: Number,
    default: 0,
  },

  followingCount: {
    type: Number,
    default: 0,
  },

  followedMangaCount: {
    type: Number,
    default: 0,
  },

  volumesRead: {
    type: Number,
    default: 0,
  },

  chaptersRead: {
    type: Number,
    default: 0,
  },

  followedAnimeCount: {
    type: Number,
    default: 0,
  },

  episodesWatch: {
    type: Number,
    default: 0,
  },

  timeSpentOnAnime: {
    type: Number,
    default: 0,
  },
}, {
  id: false,
  versionKey: false,
  timestamps: true,
  minimize: false,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

UserSchema.virtual('followers', {
  ref: 'Follow',
  localField: '_id',
  foreignField: 'followed',
});

UserSchema.virtual('following', {
  ref: 'Follow',
  localField: '_id',
  foreignField: 'follower',
});

UserSchema.virtual('anime-library', {
  ref: 'AnimeEntry',
  localField: '_id',
  foreignField: 'user',
  match: {
    isAdd: true,
  },
  options: {
    sort: { updatedAt: -1 },
  },
  limit: 20,
});

UserSchema.virtual('manga-library', {
  ref: 'MangaEntry',
  localField: '_id',
  foreignField: 'user',
  match: {
    isAdd: true,
  },
  options: {
    sort: { updatedAt: -1 },
  },
  limit: 20,
});

UserSchema.virtual('anime-favorites', {
  ref: 'AnimeEntry',
  localField: '_id',
  foreignField: 'user',
  match: {
    isAdd: true,
    isFavorites: true,
  },
  options: {
    sort: { updatedAt: -1 },
  },
  limit: 20,
});

UserSchema.virtual('manga-favorites', {
  ref: 'MangaEntry',
  localField: '_id',
  foreignField: 'user',
  match: {
    isAdd: true,
    isFavorites: true,
  },
  options: {
    sort: { updatedAt: -1 },
  },
  limit: 20,
});

UserSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'user',
});

UserSchema.virtual('requests', {
  ref: 'Request',
  localField: '_id',
  foreignField: 'user',
});


UserSchema.pre<TUser>('save', async function () {
  if (this.isModified('avatar')) {
    this.avatar = await uploadFile(
      `users/${this._id}/images/profile.jpg`,
      this.avatar,
    );
  }
});

UserSchema.pre('findOne', async function () {
  const _id = this.getFilter()._id;
  if (!_id) return;

  await User.findOneAndUpdate(this.getFilter(), {
    followersCount: await Follow.countDocuments({
      followed: _id
    }),

    followingCount: await Follow.countDocuments({
      follower: _id
    }),

    followedMangaCount: await MangaEntry.countDocuments({
      user: _id,
      isAdd: true,
    }),

    volumesRead: await MangaEntry.aggregate()
      .match({ user: _id })
      .group({
        _id: null,
        total: { $sum: '$volumesRead' },
      })
      .then((docs) => docs[0])
      .then((doc) => doc?.total),

    chaptersRead: await MangaEntry.aggregate()
      .match({ user: _id })
      .group({
        _id: null,
        total: { $sum: '$chaptersRead' },
      })
      .then((docs) => docs[0])
      .then((doc) => doc?.total),

    followedAnimeCount: await AnimeEntry.countDocuments({
      user: _id,
      isAdd: true,
    }),

    episodesWatch: await AnimeEntry.aggregate()
      .match({ user: _id })
      .group({
        _id: null,
        total: { $sum: '$episodesWatch' }
      })
      .then((docs) => docs[0])
      .then((doc) => doc?.total),

    timeSpentOnAnime: await AnimeEntry.aggregate()
      .match({ user: _id })
      .lookup({
        from: 'animes',
        localField: 'anime',
        foreignField: '_id',
        as: 'anime',
      })
      .unwind('anime')
      .group({
        _id: null,
        timeSpentOnAnime: { $sum: { $multiply: ['$episodesWatch', '$anime.episodeLength'] } },
      })
      .then((docs) => docs[0])
      .then((doc) => doc?.timeSpentOnAnime),
  });
});

UserSchema.pre<TUser>('deleteOne', async function () {
  if (this.avatar) {
    await deleteFile(
      `users/${this._id}/images/profile.jpg`,
    );
  }
});


UserSchema.plugin(MongooseMultiLanguage, {
  fields: [],
});

UserSchema.plugin(MongooseSearch, {
  fields: ['pseudo'],
});

UserSchema.plugin(MongooseJsonApi, {
  type: 'users',
  filter: {
    query: (query: string) => {
      return {
        $search: query,
      };
    },
  },
});


export type TUser = HydratedDocument<IUser, UserInstanceMethods, UserQueryHelper>;

const User = model<IUser, UserModel>('User', UserSchema);
export default User;
