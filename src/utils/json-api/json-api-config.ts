import { Request } from "express";

export default interface JsonApiConfig {
  endpoint: string;
  schema: {
    type: string;
    id: string;
    attributes: {
      [attribute: string]: string;
    };
    relationships: {
      [relationship: string]: {
        property: string;
        model?: string;
      };
    };
  };
  filters: JsonApiFiltersConfig;
}

export interface JsonApiFiltersConfig {
  [name: string]: (value: string, req: Request) => {
    where?: {
      [column: string]: null | any | any[];
    };
    group?: string;
    order?: string[];
    limit?: number;
    offset?: number;
  };
}
