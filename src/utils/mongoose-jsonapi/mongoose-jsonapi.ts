import { QueryWithHelpers, Document } from 'mongoose';

export interface JsonApiInstanceMethods extends Document {
  toJsonApi: (
    opts: {
      baseUrl: string;
      meta?: any;
    },
  ) => {
    data: JsonApiResource;
    included: JsonApiResource[];
  }
}

export interface JsonApiQueryHelper {
  withJsonApi: <ResultType extends DocType | DocType[] | null, DocType extends JsonApiInstanceMethods>(
    this: QueryWithHelpers<ResultType, DocType, JsonApiQueryHelper>,
    query: JsonApiQueryParams,
  ) => this;

  toJsonApi: <ResultType extends DocType | DocType[] | null, DocType extends JsonApiInstanceMethods & Document>(
    this: QueryWithHelpers<ResultType, DocType, JsonApiQueryHelper>,
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
  errors?: JsonApiError[];
}

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
