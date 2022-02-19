import { Document, Model, models, SchemaType, VirtualType } from "mongoose";
import JsonApiBody, { JsonApiResource } from "../json-api/json-api-body";
import UrlQuery from "../url-query/url-query";
import { JsonApiQuery } from "./jsonapi-query-parser";

interface JsonApiSerializerOptions {
  baseUrl: string;
}

export default abstract class JsonApiSerializer {

  private static options: JsonApiSerializerOptions

  static types: { [type: string]: string } = {}
  static models: { [type: string]: string } = {}
  static filters: { [type: string]: any } = {}

  static initialize(options: JsonApiSerializerOptions) {
    this.options = options;
  }


  static register(type: string, model: Model<any>, filter: any = {}) {
    this.types[model.modelName] = type;
    this.models[type] = model.modelName;
    this.filters[model.modelName] = filter;
  }


  static serialize(
    docs: Document | Document[] | null,
    options: {
      meta?: any,
      pagination?: {
        url: string;
        count: number;
        query: JsonApiQuery;
      }
    } = {},
  ) {
    const body: JsonApiBody = {
      jsonapi: {
        version: "1.0",
      },
    };

    if (Array.isArray(docs)) {
      const { data, included } = docs.map((model) => this.serializeDocument(model))
        .reduce((acc, cur) => {
          acc.data = acc.data.concat(cur.data);
          acc.included = acc.included.concat(cur.included).filter((resource1, index, arr) => {
            return arr.findIndex(resource2 => resource1.type === resource2.type && resource1.id === resource2.id) === index;
          });
          return acc;
        }, {
          data: [] as JsonApiResource[],
          included: [] as JsonApiResource[],
        });

      body.data = data;
      body.included = included;

      if (options.pagination) {
        body.links = this.paginate(
          `${this.options.baseUrl}${options.pagination.url}`,
          options.pagination.count,
          options.pagination.query
        );
      }

    } else if (docs) {
      const { data, included } = this.serializeDocument(docs);

      body.data = data;
      body.included = included;

    } else {
      body.data = null;
    }

    body.meta = options.meta;

    return body;
  }

  static serializeDocument(doc: Document) {
    const docJson = JSON.parse(JSON.stringify(doc));

    const [type, modelName] = Object.entries(this.models)
      .find(([_, modelName]) => doc instanceof (models[modelName]))
      ?? [undefined, undefined];
    if (!type) {
      throw new Error(`${doc} doesn't have a JSON:API type`);
    }

    const data: JsonApiResource = {
      type: type,
      id: doc._id?.toString(),
      links: {
        self: `${this.options.baseUrl}/${type}/${doc._id}`
      },
      attributes: {},
      relationships: {},
    };
    let included: JsonApiResource[] = [];


    Object.entries({
      ...doc.schema.paths,
      ...doc.schema.virtuals
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
          data.attributes![path] = docJson[path];

        } else if (isRelationship(type)) {
          data.relationships![path] = {
            links: {
              related: `${this.options.baseUrl}/${data.type}/${data.id}/${path}`,
            },
          };

          const isArrayOfDocument = (arr: any[]): arr is Document[] => {
            return Array.isArray(arr) && arr.every(item => item instanceof Document);
          }
          const includeToDocument = (relationship: Document) => {
            const { data: relationshipData, included: relationshipIncluded } = this.serializeDocument(relationship);
            included = included.concat(relationshipData, relationshipIncluded);

            return {
              type: relationshipData.type,
              id: relationshipData.id!,
            }
          }

          const value = doc.get(path);
          if (isArrayOfDocument(value)) {
            data.relationships![path].data = value
              .map((relationship: Document) => includeToDocument(relationship));

          } else if (value instanceof Document) {
            data.relationships![path].data = includeToDocument(value);

          }
        }
      });

    return {
      data: data,
      included: included.filter((resource1, index) => {
        return included.findIndex(resource2 => resource1.type === resource2.type && resource1.id === resource2.id) === index;
      }),
    };
  }


  static deserialize(body: any): any {
    const data: any = {};

    if (body.data?.id) {
      data._id = body.data.id;
    }

    if (body.data?.attributes) {
      Object.assign(data, body.data.attributes);
    }

    if (body.data?.relationships) {
      Object.entries(body.data.relationships)
        .forEach(([key, value]: [string, any]) => {
          if (Array.isArray(value.data)) {
            data[key] = value.data.map((d: any) => d.id)
          } else {
            data[key] = value.data.id;
          }
        });
    }

    return data;
  }


  static paginate(url: string, count: number, query: JsonApiQuery) {
    const limit = +(query.page?.limit ?? 10);
    const offset = +(query.page?.offset ?? 0);

    url = url.split("?").shift() ?? '/';

    const firstLink = `${url}?${UrlQuery.encode(Object.assign(query, {
      page: {
        limit: limit,
        offset: 0,
      },
    }))}`;
    const prevLink = (offset > 0) ?
      `${url}?${UrlQuery.encode(Object.assign(query, {
        page: {
          limit: limit,
          offset: Math.max(offset - limit, 0),
        },
      }))}` : undefined;
    const nextLink = (offset < count - limit) ?
      `${url}?${UrlQuery.encode(Object.assign(query, {
        page: {
          limit: limit,
          offset: offset + limit,
        },
      }))}` : undefined;
    const lastLink = `${url}?${UrlQuery.encode(Object.assign(query, {
      page: {
        limit: limit,
        offset: Math.max(count - limit, 0),
      },
    }))}`;

    return {
      first: firstLink,
      prev: prevLink,
      next: nextLink,
      last: lastLink,
    };
  }
}