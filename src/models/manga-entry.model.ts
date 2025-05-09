import MongooseJsonApi, { JsonApiInstanceMethods, JsonApiModel, JsonApiQueryHelper } from '@stantanasi/mongoose-jsonapi';
import { HydratedDocument, model, Model, Schema, Types } from 'mongoose';
import MongooseMultiLanguage, { MultiLanguageInstanceMethods, MultiLanguageModel, MultiLanguageQueryHelper } from '../utils/mongoose-multi-language/mongoose-multi-language';
import Manga, { TManga } from './manga.model';
import User, { TUser } from './user.model';

enum MangaEntryStatus {
  Reading = 'reading',
  Completed = 'completed',
  Planned = 'planned',
  OnHold = 'on_hold',
  Dropped = 'dropped',
}

export interface IMangaEntry {
  _id: Types.ObjectId;

  isAdd: boolean;
  isFavorites: boolean;
  status: MangaEntryStatus;
  rating: number | null;

  volumesRead: number;
  chaptersRead: number;
  startedAt: Date | null;
  finishedAt: Date | null;

  user: string | TUser;
  manga: Types.ObjectId | TManga;

  createdAt: Date;
  updatedAt: Date;
}

export type MangaEntryInstanceMethods = MultiLanguageInstanceMethods & JsonApiInstanceMethods

export type MangaEntryQueryHelper = MultiLanguageQueryHelper & JsonApiQueryHelper

export type MangaEntryModel = Model<IMangaEntry, MangaEntryQueryHelper, MangaEntryInstanceMethods> & MultiLanguageModel<IMangaEntry> & JsonApiModel<IMangaEntry> & {
  updateVolumesRead: (_id: Types.ObjectId) => Promise<void>;

  updateChaptersRead: (_id: Types.ObjectId) => Promise<void>;
}

export const MangaEntrySchema = new Schema<IMangaEntry, MangaEntryModel, MangaEntryInstanceMethods, MangaEntryQueryHelper, {}, MangaEntryModel>({
  isAdd: {
    type: Boolean,
    default: false,
  },

  isFavorites: {
    type: Boolean,
    default: false,
  },

  status: {
    type: String,
    default: MangaEntryStatus.Reading,
    enum: Object.values(MangaEntryStatus),
  },

  rating: {
    type: Number,
    default: null,
  },


  volumesRead: {
    type: Number,
    default: 0,
  },

  chaptersRead: {
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

  manga: {
    type: Schema.Types.ObjectId,
    ref: 'Manga',
    required: true
  },
}, {
  id: false,
  versionKey: false,
  timestamps: true,
  minimize: false,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

MangaEntrySchema.index({
  user: 1,
  manga: 1,
}, { unique: true });


MangaEntrySchema.statics.updateVolumesRead = async function (_id) {
  await MangaEntry.findByIdAndUpdate(_id, {
    volumesRead: await MangaEntry.aggregate()
      .match({ _id: _id })
      .lookup({
        from: 'mangas',
        localField: 'manga',
        foreignField: '_id',
        as: 'manga',
        let: { user: '$user' },
        pipeline: [
          {
            $lookup: {
              from: 'volumes',
              localField: '_id',
              foreignField: 'manga',
              as: 'volumes',
              let: { user: '$$user' },
              pipeline: [
                {
                  $lookup: {
                    from: 'volumeentries',
                    localField: '_id',
                    foreignField: 'volume',
                    as: 'volume-entry',
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
      .addFields({
        volumesRead: {
          $sum: {
            $map: {
              input: '$manga',
              as: 'manga',
              in: {
                $sum: {
                  $map: {
                    input: '$$manga.volumes',
                    as: 'volume',
                    in: {
                      $size: '$$volume.volume-entry'
                    }
                  }
                }
              }
            }
          }
        }
      })
      .then((result) => result[0].volumesRead),
  });
};

MangaEntrySchema.statics.updateChaptersRead = async function (_id) {
  await MangaEntry.findByIdAndUpdate(_id, {
    chaptersRead: await MangaEntry.aggregate()
      .match({ _id: _id })
      .lookup({
        from: 'mangas',
        localField: 'manga',
        foreignField: '_id',
        as: 'manga',
        let: { user: '$user' },
        pipeline: [
          {
            $lookup: {
              from: 'chapters',
              localField: '_id',
              foreignField: 'manga',
              as: 'chapters',
              let: { user: '$$user' },
              pipeline: [
                {
                  $lookup: {
                    from: 'chapterentries',
                    localField: '_id',
                    foreignField: 'chapter',
                    as: 'chapter-entry',
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
      .addFields({
        chaptersRead: {
          $sum: {
            $map: {
              input: '$manga',
              as: 'manga',
              in: {
                $sum: {
                  $map: {
                    input: '$$manga.chapters',
                    as: 'chapter',
                    in: {
                      $size: '$$chapter.chapter-entry'
                    }
                  }
                }
              }
            }
          }
        }
      })
      .then((result) => result[0].chaptersRead),
  });
};


MangaEntrySchema.post('save', async function () {
  await User.updateFollowedMangaCount(typeof this.user === 'string' ? this.user : this.user._id);

  await Manga.updateAverageRating(this.manga._id);
  await Manga.updateUserCount(this.manga._id);
  await Manga.updateFavoritesCount(this.manga._id);
  await Manga.updatePopularity(this.manga._id);
});

MangaEntrySchema.post('deleteOne', { document: true, query: false }, async function () {
  await User.updateFollowedMangaCount(typeof this.user === 'string' ? this.user : this.user._id);

  await Manga.updateAverageRating(this.manga._id);
  await Manga.updateUserCount(this.manga._id);
  await Manga.updateFavoritesCount(this.manga._id);
  await Manga.updatePopularity(this.manga._id);
});


MangaEntrySchema.plugin(MongooseMultiLanguage, {
  fields: [],
});

MangaEntrySchema.plugin(MongooseJsonApi, {
  type: 'manga-entries',
});


export type TMangaEntry = HydratedDocument<IMangaEntry, MangaEntryInstanceMethods, MangaEntryQueryHelper>;

const MangaEntry = model<IMangaEntry, MangaEntryModel>('MangaEntry', MangaEntrySchema);
export default MangaEntry;
