import { JsonApiError as JsonApiErrorObject } from "./json-api-body"

export default class JsonApiError extends Error {
  constructor(public data: JsonApiErrorObject) {
    super();
  }
}

export class PermissionDenied extends JsonApiError {
  constructor() {
    super({
      title: 'Permission denied',
    });
  }
}

export class NotFoundError extends JsonApiError {
  constructor(path: string) {
    super({
      status: '404',
      title: 'Route Not Found',
      detail: `The path '${path}' does not exist.`,
    })
  }
}
