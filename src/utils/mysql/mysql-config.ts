import mysql from 'mysql2';
import { ModelType, QueryOptions } from './mysql-model';
import { MySqlColumn } from './mysql-column';

export default interface MySqlConfig {
  db: {
    connection: mysql.Connection;
  };
  schema: {
    table: string;
    primaryKey: {
      property: string;
      name: string;
      type: string;
    };
    properties: {
      [property: string]: {
        name: string;
        type: MySqlColumn;
        skipOnCreate: boolean;
        skipOnUpdate: boolean;
        nullable: boolean;
      };
    };
    relations: {
      [property: string]: {
        type: "OneToOne" | "OneToMany" | "ManyToMany" | "BelongsTo";
        field: string;
        intermediateModel?: string,
        intermediateFields?: string,
        intermediateReferenceFields?: string,
        referenceModel: string;
        referenceField: string;
        options?: QueryOptions;
      };
    };
  };
}
