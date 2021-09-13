import JsonApi from "./json-api";
import JsonApiConfig, { JsonApiFiltersConfig } from "./json-api-config";

export function JsonApiType(name: string, config?: { endpoint: string }): any {
  return (constructor: Function): any => {
    JsonApi.models[name] = constructor as any;
    constructor.prototype.jsonApi = constructor.prototype.jsonApi || {};
    const jsonApi: JsonApiConfig = constructor.prototype.jsonApi || {};

    jsonApi.schema = jsonApi.schema || {};
    jsonApi.schema.type = name;

    jsonApi.endpoint = config?.endpoint || name;
  }
}

export function JsonApiId(): any {
  return (target: any, property: string): any => {
    target.constructor.prototype.jsonApi = target.constructor.prototype.jsonApi || {};
    const jsonApi: JsonApiConfig = target.constructor.prototype.jsonApi || {};

    jsonApi.schema = jsonApi.schema || {};
    jsonApi.schema.id = property;
  };
}

export function JsonApiAttribute(name?: string): any {
  return (target: any, property: string): any => {
    target.constructor.prototype.jsonApi = target.constructor.prototype.jsonApi || {};
    const jsonApi: JsonApiConfig = target.constructor.prototype.jsonApi || {};

    jsonApi.schema = jsonApi.schema || {};
    jsonApi.schema.attributes = jsonApi.schema.attributes || {};
    jsonApi.schema.attributes[name || property] = property;
  };
}

export function JsonApiRelationship(name?: string, model?: string): any {
  return (target: any, property: string): any => {
    target.constructor.prototype.jsonApi = target.constructor.prototype.jsonApi || {};
    const jsonApi: JsonApiConfig = target.constructor.prototype.jsonApi || {};

    jsonApi.schema = jsonApi.schema || {};
    jsonApi.schema.relationships = jsonApi.schema.relationships || {};
    jsonApi.schema.relationships[name || property] = {
      property: property,
      model: model,
    };
  };
}


export function JsonApiFilter(filters: JsonApiFiltersConfig): any {
  return (constructor: Function): any => {
    constructor.prototype.jsonApi = constructor.prototype.jsonApi || {};
    const jsonApi: JsonApiConfig = constructor.prototype.jsonApi || {};

    jsonApi.filters = filters;
  }
}
