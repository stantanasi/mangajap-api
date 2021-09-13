export interface JsonApiError {
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
    parameter: string;
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
      data?: JsonApiIdentifier | JsonApiIdentifier[];
      meta?: any;
    }
  };
  meta?: any;
}

export default interface JsonApiBody {
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
  errors?: JsonApiError[];
}
