import { Schema, model, Types, Document } from 'mongoose';
import { ref } from 'firebase/storage';
import { storage, uploadFile } from '../firebase-app';
import MongooseJsonApi, { JsonApiModel } from '../utils/mongoose-jsonapi/mongoose-jsonapi';
import { IAnime } from "./anime.model";
import Episode, { IEpisode } from "./episode.model";

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

  anime: Types.ObjectId & IAnime;
  episodes?: IEpisode[];

  createdAt: Date;
  updatedAt: Date;
}

export interface ISeasonModel extends JsonApiModel<ISeason> {
}

export const SeasonSchema = new Schema<ISeason, ISeasonModel>({
  titles: {
    type: Schema.Types.Mixed,
    default: {},
  },

  overview: {
    type: String,
    default: '',
  },

  number: {
    type: Number,
    required: true
  },

  posterImage: {
    type: String,
    default: null,
  },


  airDate: {
    type: Date,
    default: null,
    transform: function (this, val) {
      return val?.toISOString().slice(0, 10) ?? null;
    },
  },

  episodeCount: {
    type: Number,
    default: 0
  },


  anime: {
    type: Schema.Types.ObjectId,
    ref: 'Anime',
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

SeasonSchema.virtual('episodes', {
  ref: 'Episode',
  localField: '_id',
  foreignField: 'season',
  options: {
    sort: { number: 1 },
  },
});

SeasonSchema.index({
  number: 1,
  anime: 1
}, { unique: true });


SeasonSchema.pre<ISeason & Document>('save', async function () {
  if (this.isModified('posterImage')) {
    this.posterImage = await uploadFile(
      ref(storage, `anime/${this.anime}/seasons/${this._id}/images/poster.jpg`),
      this.posterImage,
    );
  }
});

SeasonSchema.pre('findOne', async function () {
  const _id = this.getFilter()._id;
  if (!_id) return;

  await Season.findOneAndUpdate(this.getFilter(), {
    airDate: await Episode.findOne({
      season: _id,
    }).sort({ number: 1 }).then((doc) => doc?.airDate ?? null),

    episodeCount: await Episode.count({
      season: _id,
    }),
  });
});


SeasonSchema.plugin(MongooseJsonApi, {
  type: 'seasons',
});


const Season = model<ISeason, ISeasonModel>('Season', SeasonSchema);
export default Season;
