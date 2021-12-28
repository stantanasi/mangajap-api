import { Model } from "mongoose";
import JsonApiSerializer from "./jsonapi-serializer";

export interface JsonApiQuery {
  include?: string;
  fields?: {
    [type: string]: string;
  };
  sort?: string;
  page?: {
    offset?: number;
    limit?: number;
  };
  filter?: any;
}

interface MongoosePopulate {
  path: string;
  select?: {
    [field: string]: -1 | 1;
  };
  populate?: MongoosePopulate[];
}

export interface MongooseQuery {
  populate?: MongoosePopulate[];
  sort?: {
    [field: string]: -1 | 1;
  };
  limit?: number;
  skip?: number;
  filter?: any;
}

export default class JsonApiQueryParser {

  static options: {
    defaultPagination?: {
      limit: number;
      offset: number;
    };
  } = {}

  static initialize(options: {
    defaultPagination?: {
      limit: number;
      offset: number;
    };
  }) {
    this.options = options;
  }

  static parse(query: JsonApiQuery, model: Model<any>): MongooseQuery {
    const mongooseQuery: MongooseQuery = {};

    if (query.include) {
      mongooseQuery.populate = query.include
        .split(',')
        .map(includes => includes.split('.'))
        .reduce((acc, includes) => {
          includes.reduce((acc2, include) => {
            let index = acc2.findIndex(relationship => relationship.path === include);
            if (index === -1) {
              index = acc2.push({
                path: include,
                populate: [],
              }) - 1;
            }

            return acc2[index].populate!;
          }, acc);

          return acc;
        }, [] as MongoosePopulate[]);
    }


    if (query.filter) {
      mongooseQuery.filter = {
        $and: Object.entries<string>(query.filter)
          .map(([field, values]) => {
            const filter = JsonApiSerializer.filters[model.modelName];

            return {
              $or: values.split(',')
                .map((value: string) => {
                  if (filter[field]) {
                    return filter[field](value);
                  } else {
                    return { [field]: value };
                  }
                })
            }
          })
      };
    }

    if (query.sort) {
      mongooseQuery.sort = query.sort
        .split(',')
        .reduce((acc, sort) => {
          if (sort.startsWith('-')) {
            acc[sort] = -1;
          } else {
            acc[sort] = 1;
          }
          return acc;
        }, {} as {
          [field: string]: -1 | 1;
        });
    }

    mongooseQuery.limit = query.page?.limit ?? this.options.defaultPagination?.limit;
    
    mongooseQuery.skip = query.page?.offset ?? this.options.defaultPagination?.offset;

    return mongooseQuery;
  }
}