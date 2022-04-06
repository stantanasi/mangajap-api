import { Model, Document } from "mongoose";
import { MongooseQuery } from "./jsonapi-query-parser";

export default class MongooseAdapter {

  static async find<T>(model: Model<T>, query: MongooseQuery) {
    const data = await model.find(query.filter)
      .limit(query.limit ?? 10)
      .skip(query.skip ?? 0)
      .populate(query.populate!)
      .sort(query.sort);
    const count = await model.count(query.filter);

    return {
      data: data,
      count: count,
    }
  }

  static async findById<T>(model: Model<T>, id: any, query: MongooseQuery) {
    return model.findById(id)
      .populate(query.populate!);
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
      .populate(query.populate!)
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
    return model.findById(id)
      .then((doc) => Object.assign(doc!, body))
      .then(async (doc) => await doc.save());
  }

  static async delete<T>(model: Model<T>, id: any) {
    return model.findByIdAndDelete(id);
  }


  static async findRelationship<T>(model: Model<T>, id: any, relationship: string, query: MongooseQuery) {
    const data: Document | Document[] | null = (await model.findById(id)
      .populate<any>({
        path: relationship,
        match: query.filter,
        populate: query.populate,
        options: {
          limit: query.limit,
          skip: query.skip,
          sort: query.sort,
        },
      }))
      ?.[relationship] ?? null;

    if (Array.isArray(data)) {
      const count = ((await model.findById(id)
        .populate<any>({
          path: relationship,
          match: query.filter,
        })) as any)
        ?.[relationship]
        ?.length ?? 0;

      return {
        data: data,
        count: count,
      };

    } else {
      return {
        data: data,
        count: undefined,
      };
    }
  }
}
