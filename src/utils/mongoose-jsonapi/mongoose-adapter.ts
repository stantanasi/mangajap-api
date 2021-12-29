import { Model } from "mongoose";
import { MongooseQuery } from "./jsonapi-query-parser";

export default class MongooseAdapter {

  static async find<T>(model: Model<T>, query: MongooseQuery) {
    const data = await model.find(query.filter)
      .limit(query.limit ?? 10)
      .skip(query.skip ?? 0)
      .populate(query.populate)
      .sort(query.sort);
    const count = await model.count(query.filter);

    return {
      data: data,
      count: count,
    }
  }

  static async findById<T>(model: Model<T>, id: any, query: MongooseQuery) {
    return model.findById(id)
      .populate(query.populate);
  }

  static async findByIds<T>(model: Model<T>, ids: any[], query: MongooseQuery) {
    const data = await model.find({
      _id: {
        $in: ids
      },
      ...query.filter
    })
      .limit(query.limit ?? 10)
      .skip(query.skip ?? 0)
      .populate(query.populate)
      .sort(query.sort);
    const count = await model.count({
      _id: {
        $in: ids
      },
      ...query.filter
    });

    return {
      data: data,
      count: count,
    }
  }

  static async create<T>(model: Model<T>, body: T) {
    return model.create(body);
  }

  static async update<T>(model: Model<T>, id: any, body: T) {
    return model.findByIdAndUpdate(id, body, { new: true });
  }

  static async delete<T>(model: Model<T>, id: any) {
    return model.findByIdAndDelete(id);
  }


  static async findRelationship<T, E>(model: Model<T>, id: any, relationship: string, relationshipModel: Model<E>, query: MongooseQuery) {
    const related = ((await model.findById(id)
      .populate(relationship)) as any)
      ?.[relationship];

    if (Array.isArray(related)) {
      //   const data = (await Anime.findById(req.params.id)
      //     .populate<{ seasons: (Document & ISeason)[] }>({
      //       path: 'seasons',
      //       match: query.filter,
      //       populate: query.populate,
      //       options: {
      //         limit: query.limit,
      //         skip: query.skip,
      //       },
      //     }))
      //     .seasons;
      //   const count = (await Anime.findById(req.params.id)
      //     .populate<{ seasons: (Document & ISeason)[] }>({
      //       path: 'seasons',
      //       match: query.filter,
      //     }))
      //     .seasons
      //     .length;

      return MongooseAdapter.findByIds(
        relationshipModel,
        related.map(r => r._id),
        query
      );

    } else {
      return {
        data: await MongooseAdapter.findById(
          relationshipModel,
          related._id,
          query
        ),
        count: undefined,
      };
    }
  }
}
