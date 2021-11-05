import console from "console";
import { FieldPacket, OkPacket, RowDataPacket } from "mysql2";
import { MySqlColumn } from "./mysql-column";
import MySqlConfig from "./mysql-config";

export interface ModelType<T extends MySqlModel> {
  new(): T;
}

export interface QueryOptions {
  fields?: string | string[];
  include?: string | string[] | {
    relation: string;
    scope?: QueryOptions;
  } | {
    relation: string;
    scope?: QueryOptions;
  }[];
  where?: {
    [column: string]: null | any | any[];
  };
  group?: string;
  order?: string[];
  limit?: number;
  offset?: number;
}

export default abstract class MySqlModel {

  public static models: {
    [className: string]: ModelType<any>
  } = {};

  public async initialize() { }

  public async initializeRelations() { }


  public static async findAll<T extends MySqlModel>(
    this: ModelType<T>,
    options?: QueryOptions
  ): Promise<[T[], number]> {
    const mysqlConfig: MySqlConfig = this.prototype.mysql;

    const [rows, fields]: [RowDataPacket[], FieldPacket[]] = await mysqlConfig.db.connection.promise()
      .query(MySqlModel.getPreparedQuery(this, options));

    options = options || {};
    options.fields = 'COUNT(*)';
    delete options.limit;
    delete options.offset;
    const [rowsCount, fieldsCount]: [RowDataPacket[], FieldPacket[]] = await mysqlConfig.db.connection.promise()
      .query(MySqlModel.getPreparedQuery(this, options));

    return [
      await Promise.all(rows
        .filter(row => row)
        .map((row: any) => MySqlModel.hydrateModel(this, row, options))
      ),
      rowsCount[0]['COUNT(*)'],
    ];
  }

  public static async findOne<T extends MySqlModel>(
    this: ModelType<T>,
    options?: QueryOptions
  ): Promise<T | null> {
    const mysqlConfig: MySqlConfig = this.prototype.mysql;

    options = options || {};
    options.limit = 1;

    const [rows, fields]: [RowDataPacket[], FieldPacket[]] = await mysqlConfig.db.connection.promise().query(MySqlModel.getPreparedQuery(this, options))

    if (rows[0]) {
      const model = await MySqlModel.hydrateModel(this, rows[0], options);
      await model.afterFind();
      return model;
    } else {
      return new Promise((resolve) => resolve(null))
    }
  }

  public static async findById<T extends MySqlModel>(
    this: ModelType<T>,
    id: string,
    options?: QueryOptions
  ): Promise<T | null> {
    const mysqlConfig: MySqlConfig = this.prototype.mysql;

    options = options || {};
    options.where = options.where || {};
    options.where[mysqlConfig.schema.primaryKey.property] = id;
    options.limit = 1;

    const [rows, fields]: [RowDataPacket[], FieldPacket[]] = await mysqlConfig.db.connection.promise().query(MySqlModel.getPreparedQuery(this, options))

    if (rows[0]) {
      const model = await MySqlModel.hydrateModel(this, rows[0], options);
      await model.afterFind();
      return model;
    } else {
      return new Promise((resolve) => resolve(null))
    }
  }

  public async afterFind() { }


  public async getRelated<T extends MySqlModel>(
    name: string,
    options?: QueryOptions
  ): Promise<T | [T[], number]> {
    const mysqlConfig: MySqlConfig = this.constructor.prototype.mysql;
    const relation = mysqlConfig.schema.relations[name];

    if (relation.type === 'OneToOne') {
      options = options || {};
      options = Object.assign({}, relation.options, options);
      options.where = options.where || {};
      options.where[relation.referenceField] = (this as any)?.[relation.field]

      return (MySqlModel.models[relation.referenceModel] as any).findOne(Object.assign({}, relation.options, options))

    } else if (relation.type === 'OneToMany') {
      options = options || {};
      options = Object.assign({}, relation.options, options);
      options.where = options.where || {};
      options.where[relation.referenceField] = (this as any)?.[relation.field];

      return (MySqlModel.models[relation.referenceModel] as any).findAll(Object.assign({}, relation.options, options))

    } else if (relation.type === 'ManyToMany') {
      const intermediateOptions: QueryOptions = {};
      intermediateOptions.where = intermediateOptions.where || {};
      intermediateOptions.where[relation.intermediateFields!!] = (this as any)?.[relation.field]

      const [intermediateData, count] = await (MySqlModel.models[relation.intermediateModel!!] as any).findAll(intermediateOptions)

      return [
        await Promise.all(intermediateData.map((data: any) => {
          options = options || {};
          options = Object.assign({}, relation.options, options);
          options.where = options.where || {};
          options.where[relation.referenceField] = data[relation.intermediateReferenceFields!!]

          return (MySqlModel.models[relation.referenceModel] as any).findOne(Object.assign({}, relation.options, options))
        })),
        count
      ]

    } else if (relation.type === 'BelongsTo') {
      options = options || {};
      options = Object.assign({}, relation.options, options);
      options.where = options.where || {};
      options.where[relation.referenceField] = (this as any)?.[relation.field]

      return (MySqlModel.models[relation.referenceModel] as any).findOne(Object.assign({}, relation.options, options))

    } else {
      throw new Error(`Unknown relation type: ${relation.type}`)
    }
  }


  private static getPreparedQuery(
    modelType: ModelType<any>,
    options?: QueryOptions
  ): string {
    const mysqlConfig: MySqlConfig = modelType.prototype.mysql;
    const schema = mysqlConfig.schema;

    let sql = 'SELECT ';

    if (options) {
      const properties = schema.properties;

      if (Array.isArray(options.fields)) {
        sql += ` ${options.fields.map(field => properties[field]?.name || field).join(', ')}`
      } else if (options.fields) {
        sql += ` ${properties[options.fields]?.name || options.fields}`;
      } else {
        sql += ` * `;
      }

      sql += ` FROM ${schema.table} `;

      if (options.where) {
        // const obj = { or: { name_en: '%%', name_fr: '%%' }, id: 2 };
        // const a = Object.keys(obj).reduce((cur, acc) => {
        //   if (acc === 'or') {
        //     cur.or = Object.assign({}, cur.or, obj[acc]);
        //   } else if (acc === 'and') {
        //     cur.and = Object.assign({}, cur.and, obj[acc]);
        //   } else {
        //     cur.and = Object.assign({}, cur.and, { [acc]: obj[acc] });
        //   }
        //   return cur;
        // }, {});

        const processFilter = (key: string, conditions: any): string => {
          if (Array.isArray(conditions)) {
            return conditions
              .map(condition => {
                if (!key.trim()) {
                  return condition;
                } else if (schema.primaryKey.property == key) {
                  return `${schema.primaryKey.name} = ${condition}`
                } else if (condition === null || condition === 'NULL' || condition === 'NOT NULL') {
                  return `${properties[key]?.name || key} IS ${condition}`
                } else if (typeof condition === 'string') {
                  return `${properties[key]?.name || key} LIKE '${condition}'`
                } else {
                  return `${properties[key]?.name || key} = ${condition}`
                }
              })
              .join(' OR ');
          } else {
            if (!key.trim()) {
              return conditions;
            } else if (schema.primaryKey.property == key) {
              return `${schema.primaryKey.name} = ${conditions}`
            } else if (conditions === null || conditions === 'NULL' || conditions === 'NOT NULL') {
              return `${properties[key]?.name || key} IS ${conditions}`
            } else if (typeof conditions === 'string') {
              return `${properties[key]?.name || key} LIKE '${conditions}'`
            } else {
              return `${properties[key]?.name || key} = ${conditions}`
            }
          }
        }

        sql += " WHERE " + Object.entries(options.where).map(([key, conditions]) => {
          if (key === 'or') {
            if (Array.isArray(conditions)) {
              return conditions.map(conditions => {
                return Object.entries(conditions).map(([key, conditions]) => {
                  return processFilter(key, conditions);
                }).join(' OR ');
              }).join(' OR ');
            } else {
              return Object.entries(conditions).map(([key, conditions]) => {
                return processFilter(key, conditions);
              }).join(' OR ');
            }
          } else {
            return processFilter(key, conditions);
          }
        }).join(' AND ');
      }

      if (options.order) {
        sql += " ORDER BY " + options.order.map(order => {
          const orderBy = order.match(/^(.+?)\s*?(DESC|ASC)?$/i) || [];

          if (orderBy[1] && (schema.primaryKey.property == orderBy[1] || properties[orderBy[1]])) {
            if (schema.primaryKey.property == orderBy[1]) {
              return `${schema.primaryKey.name} ${orderBy[2] || 'ASC'}`;
            } else {
              return `${properties[orderBy[1]].name} ${orderBy[2] || 'ASC'}`;
            }
          } else {
            return order;
          }
        }).join(', ')
      }

      if (options.limit) {
        sql += ` LIMIT ${options.limit}`;
      }

      if (options.offset) {
        sql += ` OFFSET ${options.offset}`;
      }
    } else {
      sql += ` * FROM ${schema.table}`
    }

    // console.log(sql + ';');
    return sql;
  }

  private static async hydrateModel<T extends MySqlModel>(
    modelType: ModelType<T>,
    row: any,
    options?: QueryOptions
  ): Promise<T> {
    const mysqlConfig: MySqlConfig = modelType.prototype.mysql;
    const model: T = new modelType();
    await model.initialize();

    if (row[mysqlConfig.schema.primaryKey.name]) {
      (model as any)[mysqlConfig.schema.primaryKey.property] = row[mysqlConfig.schema.primaryKey.name];
    }

    for (const key of Object.keys(mysqlConfig.schema.properties || {})) {
      const value = row[mysqlConfig.schema.properties[key].name];

      if (value !== null) {
        if (mysqlConfig.schema.properties[key].type === MySqlColumn.Boolean) {
          (model as any)[key] = !!value;
        } else {
          (model as any)[key] = value;
        }

      } else {
        (model as any)[key] = value;
      }
    }

    await model.initializeRelations();

    const hydrateRelations = async (model: T, property: string, options?: QueryOptions) => {
      const mysqlConfig: MySqlConfig = model.constructor.prototype.mysql;
      const relation = mysqlConfig.schema.relations?.[property];

      if (relation && (model as any)[relation.field]) {
        const related = await model.getRelated(property, options);
        if (Array.isArray(related)) {
          (model as any)[property] = related[0];
        } else {
          (model as any)[property] = related;
        }
      }
    }
    if (typeof options?.include === 'string') {
      await hydrateRelations(model, options.include);
    } else if (Array.isArray(options?.include)) {
      await Promise.all(options!!.include.map((property: string | { relation: string; scope?: QueryOptions }) => {
        if (typeof property === 'string') {
          return hydrateRelations(model, property)
        } else {
          return hydrateRelations(model, property.relation, property.scope)
        }
      }));
    } else if (options?.include) {
      await hydrateRelations(model, options.include.relation, options.include.scope);
    }

    return model;
  }

  public static decodeBody<T extends MySqlModel>(
    this: ModelType<T>,
    body: any,
  ): T {
    const mysqlConfig: MySqlConfig = this.prototype.mysql;
    const model = new this();

    for (const [key, value] of Object.entries(body)) {
      (model as any)[key] = value;
    }

    return model;
  }




  public async exists(): Promise<boolean> {
    const mysqlConfig: MySqlConfig = this.constructor.prototype.mysql;
    const modelType: ModelType<this> = (this.constructor as any);

    const id = (this as any)[mysqlConfig.schema.primaryKey.property];

    if (id) {
      const result = await (modelType as any).findById(id);
      return result != null;
    } else {
      return false;
    }
  }


  public async beforeSave() { }

  private async preSaveRelated() {
    const mysqlConfig: MySqlConfig = this.constructor.prototype.mysql;

    for (const [property, relation] of Object.entries(mysqlConfig.schema.relations || {})) {
      if (typeof (this as any)[property] === 'undefined') continue;

      if (relation.type === 'BelongsTo') {
        (this as any)[relation.field] = (this as any)[property]?.[relation.referenceField];
      }
    }
  }

  public async save(): Promise<this> {
    if (!(await this.exists())) {
      return this.create();
    } else {
      return this.update();
    }
  }

  private async postSaveRelated() {
    const mysqlConfig: MySqlConfig = this.constructor.prototype.mysql;

    for (const [property, relation] of Object.entries(mysqlConfig.schema.relations || {})) {
      if (typeof (this as any)[property] === 'undefined') continue;

      if (relation.type === 'BelongsTo') {
        continue;

      } else if (relation.type === 'OneToOne') {
        if (!(this as any)[property]) continue;

        (this as any)[property][relation.referenceField] = (this as any)[relation.field];

        await (this as any)[property].save();

      } else if (relation.type === 'OneToMany') {
        if (!(this as any)[property]) continue;

        for (const related of (this as any)[property]) {
          related[relation.referenceField] = (this as any)[relation.field];

          await related.save();
        }

      } else if (relation.type === 'ManyToMany') {
        if (!(this as any)[property]) continue;

        for (const related of (this as any)[property]) {
          const intermediateModelType = MySqlModel.models[relation.intermediateModel!!];
          const intermediateModel = new intermediateModelType();

          intermediateModel[relation.intermediateFields!!] = (this as any)[relation.field];
          intermediateModel[relation.intermediateReferenceFields!!] = related[relation.referenceField];

          await intermediateModel.save();
        }
      }
    }
  }

  public async afterSave() { }


  /** CREATE */

  public async beforeCreate() { }

  public async create(): Promise<this> {
    const mysqlConfig: MySqlConfig = this.constructor.prototype.mysql;
    const modelType: ModelType<this> = (this.constructor as any);

    await this.beforeSave();
    await this.beforeCreate();

    await this.preSaveRelated();

    let sql: string = `INSERT INTO ${mysqlConfig.schema.table} `

    const data: { [field: string]: string } = {};
    for (const [property, config] of Object.entries(mysqlConfig.schema.properties || {})) {
      if (config.skipOnCreate) continue;

      const value = (this as any)[property];
      if (value === undefined) continue;

      switch (config.type) {
        case MySqlColumn.Text:
          data[config.name] = mysqlConfig.db.connection.escape(value);
          break;
        case MySqlColumn.Date:
          data[config.name] = mysqlConfig.db.connection.escape((value as Date)?.toISOString().slice(0, 10));
          break;
        case MySqlColumn.DateTime:
          if (value) {
            data[config.name] = mysqlConfig.db.connection.escape(`${(value as Date)?.toISOString().slice(0, 10)} ${(value as Date)?.toISOString().slice(11, 19)}`);
          } else {
            data[config.name] = mysqlConfig.db.connection.escape(null);
          }
          break;

        default:
        case MySqlColumn.Int:
          data[config.name] = value;
          break;
      }
    }

    sql += ` (${Object.keys(data).join(', ')}) VALUES(${Object.values(data).join(', ')})`;

    console.log(sql + ';');

    const [result, fields]: [OkPacket, FieldPacket[]] = await mysqlConfig.db.connection.promise().query(sql);

    (this as any)[mysqlConfig.schema.primaryKey.property] = result.insertId;

    await this.postSaveRelated();

    await this.afterCreate();
    await this.afterSave();

    return (modelType as any).findById(
      result.insertId
    );
  }

  public async afterCreate() { }



  /** UPDATE */

  public async beforeUpdate() { }

  public async update(): Promise<this> {
    const mysqlConfig: MySqlConfig = this.constructor.prototype.mysql;
    const modelType: ModelType<this> = (this.constructor as any);

    await this.beforeSave();
    await this.beforeUpdate();

    await this.preSaveRelated();

    let sql: string = `UPDATE ${mysqlConfig.schema.table}`

    const data: { [field: string]: string } = {}
    for (const [property, config] of Object.entries(mysqlConfig.schema.properties || {})) {
      if (config.skipOnCreate) continue;

      const value = (this as any)[property];
      if (value === undefined) continue;

      switch (config.type) {
        case MySqlColumn.Text:
          data[config.name] = mysqlConfig.db.connection.escape(value);
          break;
        case MySqlColumn.Date:
          data[config.name] = mysqlConfig.db.connection.escape((value as Date)?.toISOString().slice(0, 10));
          break;
        case MySqlColumn.DateTime:
          if (value) {
            data[config.name] = mysqlConfig.db.connection.escape(`${(value as Date)?.toISOString().slice(0, 10)} ${(value as Date)?.toISOString().slice(11, 19)}`);
          } else {
            data[config.name] = mysqlConfig.db.connection.escape(null);
          }
          break;

        default:
        case MySqlColumn.Int:
          data[config.name] = value;
          break;
      }
    }

    if (Object.keys(data).length) {
      sql += ` SET ${Object.entries(data)
        .map(([field, value]) => `${field} = ${value}`)
        .join(', ')}`;

      sql += ` WHERE ${mysqlConfig.schema.primaryKey.name} = ${(this as any)[mysqlConfig.schema.primaryKey.property]}`

      console.log(sql + ';');

      const [result, fields]: [OkPacket, FieldPacket[]] = await mysqlConfig.db.connection.promise().query(sql);
    }

    await this.postSaveRelated();

    await this.afterUpdate();
    await this.afterSave();

    return await (modelType as any).findById(
      (this as any)[mysqlConfig.schema.primaryKey.property]
    );
  }

  public async afterUpdate() { }


  /** DELETE */

  public async beforeDelete() { }

  public async delete(): Promise<number> {
    const mysqlConfig: MySqlConfig = this.constructor.prototype.mysql;

    await this.beforeDelete();

    let sql: string = `DELETE FROM ${mysqlConfig.schema.table} WHERE ${mysqlConfig.schema.primaryKey.name} = ${(this as any)[mysqlConfig.schema.primaryKey.property]}`;

    console.log(sql + ';');

    const [result, fields]: [OkPacket, FieldPacket[]] = await mysqlConfig.db.connection.promise().query(sql);

    // TODO: delete relations

    await this.afterDelete();

    return result.affectedRows;
  }

  public async afterDelete() { }
}