import {
  Document,
  Error as MongooseError,
  FilterQuery,
  HydratedDocument,
  Model,
  PopulateOptions,
  QueryWithHelpers,
  Schema,
  SchemaType,
  VirtualType,
} from 'mongoose';
import UrlQuery from '../url-query/url-query';

export default function MongooseJsonApi<DocType, M extends JsonApiModel<DocType>>(
  _schema: Schema<DocType, M>,
  options: {
    type: string;
    filter?: {
      [field: string]: (value: string) => FilterQuery<DocType>;
    };
  },
) {
  const schema = _schema as Schema<DocType, M, JsonApiInstanceMethods, JsonApiQueryHelper>;


  schema.statics.fromJsonApi = function (body) {
    const doc: any = {};

    if (body.data?.id) {
      doc._id = body.data.id;
    }

    if (body.data?.attributes) {
      Object.assign(doc, body.data.attributes);
    }

    if (body.data?.relationships) {
      Object.entries(body.data.relationships)
        .forEach(([key, value]: [string, any]) => {
          if (Array.isArray(value.data)) {
            doc[key] = value.data.map((d: any) => d.id)
          } else {
            doc[key] = value.data.id;
          }
        });
    }

    return new this(doc);
  };


  schema.query.getRelationship = function (relationship) {
    this.setOptions({
      getRelationship: relationship,
    });

    this.populate(relationship);

    return this.transform((doc) => {
      return doc?.get(relationship) ?? null;
    });
  };

  schema.query.withJsonApi = function (query) {
    if (this.getOptions().getRelationship) {
      this.populate({
        path: this.getOptions().getRelationship,

        // Filtering
        match: query.filter ? {
          $and: Object.entries(query.filter)
            .map(([field, values]) => {
              return {
                $or: values.split(',')
                  .map((value: string) => {
                    if (options.filter?.[field]) {
                      return options.filter[field](value);
                    } else {
                      return { [field]: value };
                    }
                  })
              };
            })
        } : undefined,

        // Inclusion of Related Resources
        populate: query.include
          ?.split(',')
          .map(includes => includes.split('.'))
          .reduce((acc, includes) => {
            includes.reduce((acc2, include) => {
              let index = acc2.findIndex(relationship => relationship.path === include);
              if (index === -1) {
                index = acc2.push({
                  path: include,
                  populate: [],
                  // // TODO: implement JSON:API Sparse Fieldsets (eg. fields[type]=....)
                  // select: query.fields?.[type]
                  //   ?.split(',')
                  //   .reduce((acc, field) => {
                  //     acc[field] = 1;
                  //     return acc;
                  //   }, {} as {
                  //     [field: string]: 0 | 1;
                  //   }),
                }) - 1;
              }

              return acc2[index].populate as PopulateOptions[];
            }, acc);

            return acc;
          }, [] as PopulateOptions[]),

        // // TODO: implement JSON:API Sparse Fieldsets (eg. fields[type]=....)
        // select: query.fields?.[type]
        //   ?.split(',')
        //   .reduce((acc, field) => {
        //     acc[field] = 1;
        //     return acc;
        //   }, {} as {
        //     [field: string]: 0 | 1;
        //   }),

        options: {
          // Pagination limit
          limit: +(query.page?.limit ?? 10),

          // Pagination offset
          skip: +(query.page?.offset ?? 0),

          // Sorting
          sort: query.sort
            ?.split(',')
            .reduce((acc, sort) => {
              if (sort.charAt(0) === '-') {
                acc[sort.slice(1)] = -1;
              } else {
                acc[sort] = 1;
              }
              return acc;
            }, {} as {
              [field: string]: -1 | 1;
            }),
        },
      });

    } else {
      // Inclusion of Related Resources
      if (query.include) {
        this.populate(query.include
          .split(',')
          .map(includes => includes.split('.'))
          .reduce((acc, includes) => {
            includes.reduce((acc2, include) => {
              let index = acc2.findIndex(relationship => relationship.path === include);
              if (index === -1) {
                index = acc2.push({
                  path: include,
                  populate: [],
                  // // TODO: implement JSON:API Sparse Fieldsets (eg. fields[type]=....)
                  // select: query.fields?.[type]
                  //   ?.split(',')
                  //   .reduce((acc, field) => {
                  //     acc[field] = 1;
                  //     return acc;
                  //   }, {} as {
                  //     [field: string]: 0 | 1;
                  //   }),
                }) - 1;
              }

              return acc2[index].populate as PopulateOptions[];
            }, acc);

            return acc;
          }, [] as PopulateOptions[]));
      }

      // Sparse Fieldsets
      if (query.fields) {
        this.select(query.fields[options.type]
          ?.split(',')
          .reduce((acc, field) => {
            acc[field] = 1;
            return acc;
          }, {} as {
            [field: string]: 0 | 1;
          }));
      }

      // Sorting
      if (query.sort) {
        this.sort(query.sort
          .split(',')
          .reduce((acc, sort) => {
            if (sort.charAt(0) === '-') {
              acc[sort.slice(1)] = -1;
            } else {
              acc[sort] = 1;
            }
            return acc;
          }, {} as {
            [field: string]: -1 | 1;
          }));
      }


      // Pagination limit
      if (query.page?.limit) {
        this.limit(+query.page?.limit);
      } else {
        this.limit(10);
      }

      // Pagination offset
      if (query.page?.offset) {
        this.skip(+query.page?.offset);
      } else {
        this.skip(0);
      }

      // Filtering
      if (query.filter) {
        this.merge({
          $and: Object.entries(query.filter)
            .map(([field, values]) => {
              return {
                $or: values.split(',')
                  .map((value: string) => {
                    if (options.filter?.[field]) {
                      return options.filter[field](value);
                    } else {
                      return { [field]: value } as any;
                    }
                  })
              };
            })
        });
      }
    }

    return this;
  };

  schema.query.toJsonApi = function (opts) {
    // Throw an error if no document has been found
    if ((this as any).op === 'findOne') {
      this.orFail();
    }

    return this.transform((doc) => {
      const body: JsonApiBody = {
        jsonapi: {
          version: '1.0',
        },
      };

      if (Array.isArray(doc)) {
        const { data, included } = doc
          .map((model) => model.toJsonApi(opts) as {
            data: JsonApiResource;
            included: JsonApiResource[];
          })
          .reduce((acc, cur) => {
            acc.data = acc.data.concat(cur.data);
            acc.included = acc.included.concat(cur.included).filter((resource1, index, arr) => {
              return arr.findIndex((resource2) => resource1.type === resource2.type && resource1.id === resource2.id) === index;
            });
            return acc;
          }, {
            data: [] as JsonApiResource[],
            included: [] as JsonApiResource[],
          });

        body.data = data;
        body.included = included;

      } else if (doc) {
        const { data, included } = doc.toJsonApi(opts);

        body.data = data;
        body.included = included;

      } else {
        body.data = null;
      }

      body.meta = opts.meta;

      return body;
    });
  };

  schema.query.paginate = function (opts) {
    return this.transform(async (body) => {
      const url = opts.url.split("?").shift() ?? '/';

      let count = 0;
      if (this.getOptions().getRelationship) {
        const relationship = this.getOptions().getRelationship;

        count = await this.model.findOne(this.getFilter())
          .populate({
            path: relationship,
            match: (this.mongooseOptions().populate as any)[relationship].match,
            options: {
              limit: 0,
            },
          })
          .then((doc) => {
            if (Array.isArray(doc?.get(relationship))) {
              return doc?.get(relationship).length;
            } else {
              return 0;
            }
          });

      } else {
        count = await this.model.countDocuments(this.getFilter());
      }

      const limit = +(opts.query.page?.limit ?? 10);
      const offset = +(opts.query.page?.offset ?? 0);

      const firstLink = `${url}?${UrlQuery.encode(Object.assign(opts.query, {
        page: {
          limit: limit,
          offset: 0,
        },
      }))}`;
      const prevLink = (offset > 0) ?
        `${url}?${UrlQuery.encode(Object.assign(opts.query, {
          page: {
            limit: limit,
            offset: Math.max(offset - limit, 0),
          },
        }))}` : undefined;
      const nextLink = (offset < count - limit) ?
        `${url}?${UrlQuery.encode(Object.assign(opts.query, {
          page: {
            limit: limit,
            offset: offset + limit,
          },
        }))}` : undefined;
      const lastLink = `${url}?${UrlQuery.encode(Object.assign(opts.query, {
        page: {
          limit: limit,
          offset: Math.max(count - limit, 0),
        },
      }))}`;

      body.links = {
        first: firstLink,
        prev: prevLink,
        next: nextLink,
        last: lastLink,
      };

      body.meta = Object.assign({}, body.meta, {
        count: count,
      });

      return body;
    });
  };


  schema.methods.toJsonApi = function (opts) {
    const body: JsonApiBody = {
      jsonapi: {
        version: '1.0',
      },
    };

    const obj: any = this.toObject();

    const type = options.type;
    const id = this._id?.toString();

    if (!type) {
      throw new Error(`${this} doesn't have a JSON:API type`);
    }

    const data: JsonApiResource = {
      type: type,
      id: id,
      links: {
        self: `${opts.baseUrl}/${type}/${id}`,
      },
      attributes: {},
      relationships: {},
    };
    let included: JsonApiResource[] = [];


    Object.entries({
      ...this.schema.paths,
      ...this.schema.virtuals
    } as {
      [key: string]: SchemaType | VirtualType
    })
      .map(([path, type]) => {
        const isId = (type: SchemaType | VirtualType): boolean => {
          return (type as any).path === '_id';
        }
        const isAttribute = (type: SchemaType | VirtualType): boolean => {
          return !isId(type) && !isRelationship(type);
        }
        const isRelationship = (type: SchemaType | VirtualType): boolean => {
          return !!(type as any).options?.ref || !!(type as any).options.type?.[0]?.ref ||
            !!(type as any).options?.refPath || !!(type as any).options.type?.[0]?.refPath;
        }

        if (isAttribute(type)) {
          data.attributes![path] = obj[path];

        } else if (isRelationship(type)) {
          data.relationships![path] = {
            links: {
              related: `${opts.baseUrl}/${data.type}/${data.id}/${path}`,
            },
          };

          if (this.populated(path)) {
            const value = this.get(path) as JsonApiInstanceMethods | JsonApiInstanceMethods[] | null;

            if (Array.isArray(value)) {
              data.relationships![path].data = value
                .map((relationship) => {
                  const { data: relationshipData, included: relationshipIncluded } = relationship.toJsonApi(opts) as {
                    data: JsonApiResource;
                    included: JsonApiResource[];
                  };
                  included = included.concat(relationshipData, relationshipIncluded);

                  return {
                    type: relationshipData.type,
                    id: relationshipData.id!,
                  };
                });
            } else if (value) {
              const { data: relationshipData, included: relationshipIncluded } = value.toJsonApi(opts) as {
                data: JsonApiResource;
                included: JsonApiResource[];
              };
              included = included.concat(relationshipData, relationshipIncluded);

              data.relationships![path].data = {
                type: relationshipData.type,
                id: relationshipData.id!,
              };
            } else {
              data.relationships![path].data = null;
            }
          }
        }
      });

    body.data = data;
    body.included = included.filter((resource1, index) => {
      return included.findIndex(resource2 => resource1.type === resource2.type && resource1.id === resource2.id) === index;
    });
    body.meta = opts.meta;

    return body;
  };

  schema.methods.merge = function (...sources) {
    sources = sources.map((source) => {
      if (source instanceof Document) {
        return source.directModifiedPaths().reduce((acc, cur) => {
          cur.split('.').reduce((obj, path, i, arr) => {
            if (i !== arr.length - 1) {
              return obj[path] = {};
            } else {
              return obj[path] = source.get(cur);
            }
          }, acc);
          return acc;
        }, {} as any);

      } else {
        return source;
      }
    });

    return Object.assign(this, ...sources);
  };
}

export interface JsonApiModel<T> extends Model<T, JsonApiQueryHelper, JsonApiInstanceMethods> {
  fromJsonApi: (body: any) => HydratedDocument<T, JsonApiInstanceMethods>;
}

export interface JsonApiInstanceMethods extends Document {
  toJsonApi: (
    opts: {
      baseUrl: string;
      meta?: any;
    },
  ) => JsonApiBody;

  merge: (...sources: any[]) => this;
}

export interface JsonApiQueryHelper {
  getRelationship: <ResultType = any, DocType extends JsonApiInstanceMethods & Document = JsonApiInstanceMethods & Document>(
    this: QueryWithHelpers<DocType | null, DocType, JsonApiQueryHelper>,
    relationship: string,
  ) => QueryWithHelpers<ResultType, DocType, JsonApiQueryHelper>;

  withJsonApi: <DocType extends JsonApiInstanceMethods>(
    this: QueryWithHelpers<DocType | DocType[] | null, DocType, JsonApiQueryHelper>,
    query: JsonApiQueryParams,
  ) => this;

  toJsonApi: <DocType extends JsonApiInstanceMethods & Document>(
    this: QueryWithHelpers<DocType | DocType[] | null, DocType, JsonApiQueryHelper>,
    opts: {
      baseUrl: string;
      meta?: any;
    },
  ) => QueryWithHelpers<JsonApiBody, DocType, JsonApiQueryHelper>;

  paginate: <DocType>(
    this: QueryWithHelpers<JsonApiBody, DocType, JsonApiQueryHelper>,
    opts: {
      url: string;
      query: JsonApiQueryParams;
    },
  ) => this;
}


export interface JsonApiQueryParams {
  include?: string;
  fields?: {
    [type: string]: string;
  };
  sort?: string;
  page?: {
    offset?: number;
    limit?: number;
  };
  filter?: {
    [type: string]: string;
  };
}


export interface JsonApiBody {
  jsonapi?: {
    version: string;
  };
  data?: JsonApiResource | JsonApiResource[] | null;
  included?: JsonApiResource[];
  meta?: {
    count: number;
  } | any;
  links?: {
    first?: string;
    prev?: string;
    next?: string;
    last?: string;
  };
  errors?: IJsonApiError[];
}

export interface IJsonApiError {
  id?: string;
  links?: {
    about?: string;
  };
  status?: string;
  code?: string;
  title?: string;
  detail?: string;
  source?: {
    pointer?: string;
    parameter?: string;
  };
  meta?: any;
}

export interface JsonApiIdentifier {
  type: string;
  id: string;
}

export interface JsonApiResource {
  type: string;
  id?: string;
  links?: {
    self?: string;
    related?: string;
  };
  attributes?: {
    [attribute: string]: any;
  };
  relationships?: {
    [relationship: string]: {
      links?: {
        self?: string;
        related?: string;
      };
      data?: JsonApiIdentifier | JsonApiIdentifier[] | null;
      meta?: any;
    }
  };
  meta?: any;
}


export class JsonApiError extends Error implements IJsonApiError {

  id?: string;
  links?: {
    about?: string;
  };
  status?: string;
  code?: string;
  title?: string;
  detail?: string;
  source?: {
    pointer?: string;
    parameter?: string;
  };
  meta?: any;

  constructor(obj: IJsonApiError) {
    super();
    Object.assign(this, obj);
  }

  static from(err: Error): JsonApiError {
    if (err instanceof MongooseError.DocumentNotFoundError) {
      return new JsonApiError({
        status: '404',
        title: 'Resource not Found',
        detail: err.message,
        meta: {
          stack: err.stack,
        },
      });
    } else {
      return new JsonApiError({
        status: '500',
        title: err.name,
        detail: err.message,
        meta: {
          stack: err.stack,
        },
      });
    }
  }

  toJSON(): JsonApiBody {
    const body: JsonApiBody = {
      errors: [],
    };

    body.errors?.push({
      id: this.id,
      links: this.links,
      status: this.status,
      code: this.code,
      title: this.title,
      detail: this.detail,
      source: this.source,
      meta: this.meta,
    });

    return body;
  }


  static PermissionDenied = class extends JsonApiError {
    constructor() {
      super({
        status: '403',
        title: 'Permission denied',
      });
    }
  }

  static RouteNotFoundError = class extends JsonApiError {
    constructor(path: string) {
      super({
        status: '404',
        title: 'Route not found',
        detail: `The path '${path}' does not exist.`,
      })
    }
  }

  static ResourceNotFoundError = class extends JsonApiError {
    constructor(id: any) {
      super({
        status: '404',
        title: 'Resource not Found',
        detail: `The resource identified by ${id} could not be found`,
      })
    }
  }

  static MissingAttribute = class extends JsonApiError {
    constructor(attribute: string) {
      super({
        status: '400',
        title: 'Missing attribute',
        detail: `Missing required attribute: ${attribute}`,
      })
    }
  }
}
