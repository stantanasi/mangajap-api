import mysql from 'mysql2';
import MySqlModel, { ModelType, QueryOptions } from './mysql-model';
import { MySqlColumn } from './mysql-column';
import MySqlConfig from './mysql-config';

export function Entity(config: {
  database: {
    connection: mysql.Connection;
  };
  table: string;
}): any {
  return (constructor: Function): any => {
    MySqlModel.models[constructor.name] = constructor as any;
    constructor.prototype.mysql = constructor.prototype.mysql || {};
    const mysql: MySqlConfig = constructor.prototype.mysql || {};

    mysql.schema = mysql.schema || {};

    mysql.db = config.database;
    mysql.schema.table = config.table;
  }
}

export function PrimaryKey(name?: string): any {
  return (target: any, property: string): any => {
    target.constructor.prototype.mysql = target.constructor.prototype.mysql || {};
    const mysql: MySqlConfig = target.constructor.prototype.mysql || {};

    mysql.schema = mysql.schema || {};
    mysql.schema.primaryKey = mysql.schema.primaryKey || {};

    mysql.schema.primaryKey.property = property;
    mysql.schema.primaryKey.name = name || property;
  };
}

export function Column(name?: string, config?: {
  type?: MySqlColumn;
  skipOnCreate?: boolean;
  skipOnUpdate?: boolean;
  nullable?: boolean;
}): any {
  return (target: any, property: string): any => {
    target.constructor.prototype.mysql = target.constructor.prototype.mysql || {};
    const mysql: MySqlConfig = target.constructor.prototype.mysql || {};

    mysql.schema = mysql.schema || {};
    mysql.schema.properties = mysql.schema.properties || {};
    mysql.schema.properties[property] = mysql.schema.properties[property] || {};

    mysql.schema.properties[property] = {
      name: name || property,
      type: config?.type || MySqlColumn.Text,
      skipOnCreate: config?.skipOnCreate || false,
      skipOnUpdate: config?.skipOnUpdate || false,
      nullable: config?.nullable || false,
    };
  };
}


export function OneToOne<T extends MySqlModel>(
  field: string,
  referenceModel: ModelType<T>,
  referenceModelName: string,
  referenceField: string,
  options?: QueryOptions
): ((target: any, property: string) => any) {
  return (target: any, property: string): any => {
    target.constructor.prototype.mysql = target.constructor.prototype.mysql || {};
    const mysql: MySqlConfig = target.constructor.prototype.mysql || {};

    mysql.schema = mysql.schema || {};
    mysql.schema.relations = mysql.schema.relations || {};
    mysql.schema.relations[property] = mysql.schema.relations[property] || {};

    mysql.schema.relations[property] = {
      type: "OneToOne",
      field: field,
      referenceModel: referenceModelName,
      referenceField: referenceField,
      options: options
    }
  };
}

export function OneToMany<T extends MySqlModel>(
  field: string,
  referenceModel: ModelType<T>,
  referenceModelName: string,
  referenceField: string,
  options?: QueryOptions
): ((target: any, property: string) => any) {
  return (target: any, property: string): any => {
    target.constructor.prototype.mysql = target.constructor.prototype.mysql || {};
    const mysql: MySqlConfig = target.constructor.prototype.mysql || {};

    mysql.schema = mysql.schema || {};
    mysql.schema.relations = mysql.schema.relations || {};
    mysql.schema.relations[property] = mysql.schema.relations[property] || {};

    mysql.schema.relations[property] = {
      type: "OneToMany",
      field: field,
      referenceModel: referenceModelName,
      referenceField: referenceField,
      options: options
    }
  };
}

export function ManyToMany<T extends MySqlModel, E extends MySqlModel>(
  field: string,
  intermediateModel: ModelType<T>,
  intermediateModelName: string,
  intermediateFields: string,
  intermediateReferenceFields: string,
  referenceModel: ModelType<E>,
  referenceModelName: string,
  referenceField: string,
  options?: QueryOptions
): ((target: any, property: string) => any) {
  return (target: any, property: string): any => {
    target.constructor.prototype.mysql = target.constructor.prototype.mysql || {};
    const mysql: MySqlConfig = target.constructor.prototype.mysql || {};

    mysql.schema = mysql.schema || {};
    mysql.schema.relations = mysql.schema.relations || {};
    mysql.schema.relations[property] = mysql.schema.relations[property] || {};

    mysql.schema.relations[property] = {
      type: "ManyToMany",
      field: field,
      intermediateModel: intermediateModelName,
      intermediateFields: intermediateFields,
      intermediateReferenceFields: intermediateReferenceFields,
      referenceModel: referenceModelName,
      referenceField: referenceField,
      options: options
    }
  };
}

export function BelongsTo<T extends MySqlModel>(
  field: string,
  referenceModel: ModelType<T>,
  referenceModelName: string,
  referenceField: string,
  options?: QueryOptions
): ((target: any, property: string) => any) {
  return (target: any, property: string): any => {
    target.constructor.prototype.mysql = target.constructor.prototype.mysql || {};
    const mysql: MySqlConfig = target.constructor.prototype.mysql || {};

    mysql.schema = mysql.schema || {};
    mysql.schema.relations = mysql.schema.relations || {};
    mysql.schema.relations[property] = mysql.schema.relations[property] || {};

    mysql.schema.relations[property] = {
      type: "BelongsTo",
      field: field,
      referenceModel: referenceModelName,
      referenceField: referenceField,
      options: options
    }
  };
}
