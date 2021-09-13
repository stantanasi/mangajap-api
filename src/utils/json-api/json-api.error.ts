import JsonApi from "./json-api"

export interface JsonApiErrorObject {
  id?: string;
  links?: {
    about: string;
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

export default class JsonApiError extends Error {
  constructor(error: JsonApiErrorObject) {
    super();
    JsonApi.res.status(error.status ? +error.status : 400).json({
      errors: [error]
    });
  }
}

export class PermissionDenied extends JsonApiError {
  constructor() {
    super({
      title: 'Permission denied',
    });
  }
}