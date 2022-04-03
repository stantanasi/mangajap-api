import { Schema, model, Types } from 'mongoose';
import JsonApiSerializer from '../utils/mongoose-jsonapi/jsonapi-serializer';
import { IAnime } from "./anime.model";
import Episode, { IEpisode } from "./episode.model";

export interface ISeason {
  _id: Types.ObjectId;

  titles: {
    [language: string]: string;
  };
  number: number;
  episodeCount: number;

  anime: Types.ObjectId & IAnime;
  episodes?: IEpisode[];

  createdAt: Date;
  updatedAt: Date;
}

export const SeasonSchema = new Schema<ISeason>({
  titles: {
    type: Schema.Types.Mixed,
    default: {},
  },

  number: {
    type: Number,
    required: true
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


SeasonSchema.pre('findOne', async function () {
  const _id = this.getQuery()._id;
  if (!_id) return;

  await Season.findOneAndUpdate(this.getQuery(), {
    episodeCount: await Episode.count({
      season: _id,
    }),
  });
});


const Season = model<ISeason>('Season', SeasonSchema);
export default Season;


JsonApiSerializer.register('seasons', Season);
