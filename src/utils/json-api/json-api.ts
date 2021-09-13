import console from "console";
import { Request, Response } from "express";
import MySqlModel, { QueryOptions } from "../mysql/mysql-model";
import { MySqlColumn } from "../mysql/mysql-column";
import MySqlConfig from "../mysql/mysql-config";
import UrlQuery from "../url-query/url-query";
import JsonApiBody, { JsonApiResource } from "./json-api-body";
import JsonApiConfig from "./json-api-config";

export interface ModelType<T> {
  new(): T;
}

export default class JsonApi {

  public static models: {
    [className: string]: ModelType<any>
  } = {};

  public static req: Request; // TODO: essayer de supprimer
  public static res: Response;

  public static apiUrl(req: Request): string {
    return `${req.protocol}://${req.get('host')}`;
  }


  public static initialize(req: Request, res: Response) {
    JsonApi.req = req;
    JsonApi.res = res;
  }


  public static decode(data: JsonApiResource) {
    const modelType = JsonApi.models[data.type];

    if (modelType) {
      const jsonApiConfig: JsonApiConfig = modelType.prototype.jsonApi;
      const mysqlConfig: MySqlConfig = modelType.prototype.mysql;
      const model = new modelType();

      model[jsonApiConfig.schema.id] = data.id ? +data.id : undefined;

      for (const [attribute, property] of Object.entries(jsonApiConfig.schema.attributes || {})) {
        const value = !attribute.includes('.') ?
          data.attributes?.[attribute] :
          attribute.split('.').reduce((o, i) => o?.[i], data.attributes);

        if (value === undefined) {
          continue;
        }

        switch (mysqlConfig.schema.properties[property]?.type) {
          case MySqlColumn.Date:
          case MySqlColumn.DateTime:
            if (value) {
              model[property] = new Date(value);
            } else {
              model[property] = value;
            }
            break;

          default:
            model[property] = value;
            break;
        }
      }

      for (const [relationship, config] of Object.entries(jsonApiConfig.schema.relationships || {})) {
        const relationshipData = data.relationships?.[relationship]?.data;

        if (Array.isArray(relationshipData)) {
          model[config.property] = relationshipData.map(data => JsonApi.decode(data));
        } else if (relationshipData) {
          model[config.property] = JsonApi.decode(relationshipData);
        }
      }

      return model;
    } else {
      return null;
    }
  }


  public static encode<T extends MySqlModel>(req: Request, models: T | T[] | null, count: number = 0): JsonApiBody {
    const body: JsonApiBody = {
      jsonapi: {
        version: "1.0",
      },
    }

    if (Array.isArray(models)) {
      body.data = [];
      body.included = [];

      models.map(model => {
        const [data, included] = JsonApi.encodeModel(req, model);

        body.data = (body.data as JsonApiResource[]).concat(data);
        body.included = body.included!!.concat(included);
      });

      const query: any = req.query || {};
      const url = `${JsonApi.apiUrl(req)}${req.originalUrl.split("?").shift()}`
      const limit = query.page?.limit ? +query.page.limit : 10;
      const offset = query.page?.offset ? +query.page.offset : 0;
      body.links = {
        first: `${url}?` + UrlQuery.encode(Object.assign(query, {
          page: {
            limit: limit,
            offset: 0,
          },
        })),
        prev: (offset > 0) ?
          `${url}?` + UrlQuery.encode(Object.assign(query, {
            page: {
              limit: limit,
              offset: Math.max(offset - limit, 0),
            },
          })) : undefined,
        next: (offset < count - limit) ?
          `${url}?` + UrlQuery.encode(Object.assign(query, {
            page: {
              limit: limit,
              offset: offset + limit,
            },
          })) : undefined,
        last: `${url}?` + UrlQuery.encode(Object.assign(query, {
          page: {
            limit: limit,
            offset: Math.max(count - limit, 0),
          },
        })),
      };
      body.meta = {
        count: count,
      }
    } else if (models) {
      const [data, included] = JsonApi.encodeModel(req, models);

      body.data = data;
      body.included = included;
    } else {
      body.data = null;
    }

    return body
  }

  private static encodeModel(req: Request, model: MySqlModel, include?: any): [JsonApiResource, JsonApiResource[]] {
    const jsonApiConfig: JsonApiConfig = model.constructor.prototype.jsonApi;
    const mysqlConfig: MySqlConfig = model.constructor.prototype.mysql;

    const data: JsonApiResource = {
      type: jsonApiConfig.schema.type,
      id: (model as any)[jsonApiConfig.schema.id].toString(),
      links: {
        self: `${JsonApi.apiUrl(req)}/${jsonApiConfig.endpoint}/${(model as any)[jsonApiConfig.schema.id]}`
      },
      attributes: {},
      relationships: {},
    }
    let included: JsonApiResource[] = []

    for (const [attribute, property] of Object.entries(jsonApiConfig.schema.attributes || {})) {
      if (
        (req.query.fields as any)?.[jsonApiConfig.schema.type] &&
        !(req.query.fields as any)[jsonApiConfig.schema.type].split(',').includes(attribute)
      ) {
        continue;
      }

      let value = (model as any)[property];

      switch (mysqlConfig.schema.properties[property]?.type) {
        case MySqlColumn.Date:
          value = (value as Date)?.toISOString().slice(0, 10)
          break;
      }

      if (!attribute.includes('.')) {
        data.attributes!![attribute] = value;
      } else {
        attribute.split('.').reduce((o1, o2, index, arr) => {
          if (index !== arr.length - 1) {
            o1[o2] = Object.assign(o1[o2] || {}, {});
          } else {
            o1[o2] = value;
          }
          return o1[o2];
        }, data.attributes!!)
      }
    }

    for (const [relationship, config] of Object.entries(jsonApiConfig.schema.relationships || {})) {
      if (
        (req.query.fields as any)?.[jsonApiConfig.schema.type] &&
        !(req.query.fields as any)[jsonApiConfig.schema.type].split(',').includes(relationship)
      ) {
        continue;
      }

      data.relationships!![relationship] = {
        links: {
          related: `${JsonApi.apiUrl(req)}/${jsonApiConfig.endpoint}/${data.id}/${relationship}`,
        }
      }

      include = include ?? req.query?.include?.toString()
        .split(',')
        .map(includes => includes.split('.'))
        .reduce((acc, includes) => {
          includes.reduce((acc2, name, i2, array2) => {
            if (i2 !== array2.length - 1) {
              acc2[name] = Object.assign(acc2[name] || {}, {});
            } else {
              acc2[name] = false;
            }
            return acc2[name];
          }, acc)
          return acc
        }, {} as any);
      if (include) {

        for (const [name, includes] of Object.entries(include)) {
          if (name === relationship) {

            const includeToDocument = (model: MySqlModel) => {
              const [relationshipData, relationshipIncluded] = JsonApi.encodeModel(req, model, includes);
              included = included.concat(relationshipData, relationshipIncluded);
              return {
                type: relationshipData.type,
                id: relationshipData.id!!,
              }
            }

            if (Array.isArray((model as any)[config.property])) {
              data.relationships!![relationship].data = (model as any)[config.property].map((m: MySqlModel) => {
                return includeToDocument(m);
              });
            } else if ((model as any)[config.property]) {
              data.relationships!![relationship].data = includeToDocument((model as any)[config.property])
            }
          }
        }
      }
    }

    included = included.filter((resource1, index) => {
      return included.findIndex(resource2 => resource1.type === resource2.type && resource1.id === resource2.id) === index;
    });

    return [data, included];
  }



  public static parameters(req: Request, modelType: ModelType<any>): QueryOptions {
    const jsonApiConfig: JsonApiConfig = modelType.prototype.jsonApi;
    const query = req.query;
    const queryOptions: QueryOptions = {};

    if (query.include) {
      queryOptions.include = query.include.toString()
        .split(',')
        .map(includes => includes.split('.'))
        .reduce((acc, includes) => {
          let relationshipConfig: JsonApiConfig | undefined;

          includes.reduce((acc2, include) => {
            const config = relationshipConfig || jsonApiConfig;
            relationshipConfig = JsonApi.models[config.schema.relationships[include]?.model || ""]?.prototype?.jsonApi;
            let index = acc2.findIndex(relationship => relationship.relation === include);

            if (index === -1) {
              index = acc2.push({
                relation: config.schema.relationships[include]?.property || include,
                scope: {
                  include: []
                },
              }) - 1;
            }

            return acc2[index].scope.include;
          }, acc);

          return acc;
        }, [] as any[]);
    }

    let filtersOrder: string[] = [];
    let filterLimit: number | undefined;
    if (query.filter) {
      queryOptions.where = Object.keys(query.filter)
        .reduce((acc, cur) => {
          const jsonApiConfig: JsonApiConfig = modelType.prototype.jsonApi;
          if (jsonApiConfig.filters[cur]) {
            (query.filter as any)[cur]
              .split(',')
              .map((value: string) => {
                const filterWhere = jsonApiConfig.filters[cur](value, req).where;
                const filterOrder = jsonApiConfig.filters[cur](value, req).order;

                if (filterWhere) {
                  for (const key in filterWhere) {
                    acc[key] = acc[key] || [];
                    if (Array.isArray(filterWhere[key])) {
                      acc[key] = acc[key].concat(filterWhere[key]);
                    } else {
                      acc[key].push(filterWhere[key]);
                    }
                  }
                }
                if (filterOrder) {
                  filtersOrder = filtersOrder.concat(filterOrder);
                }
                if (jsonApiConfig.filters[cur](value, req).limit) {
                  filterLimit = jsonApiConfig.filters[cur](value, req).limit;
                }
              })
          } else {
            acc[cur] = (query.filter as any)[cur].split(',');
          }
          return acc;
        }, {} as any)
    }

    if (query.sort) {
      queryOptions.order = filtersOrder.concat(query.sort.toString()
        .split(',')
        .map(sort => {
          if (sort === 'random') {
            return 'RAND()';
          } else if (sort.startsWith('-')) {
            return sort.substring(1) + ' DESC';
          } else {
            return sort + ' ASC';
          }
        }));
    } else if (filtersOrder.length > 0) {
      queryOptions.order = filtersOrder;
    }

    if ((query.page as any)?.limit) {
      queryOptions.limit = +(query.page as any)?.limit;
    } else if (filterLimit) {
      queryOptions.limit = filterLimit;
    } else {
      queryOptions.limit = 10;
    }

    if ((query.page as any)?.offset) {
      queryOptions.offset = +(query.page as any)?.offset;
    }

    return queryOptions;
  }
}
