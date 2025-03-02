import {
  HydratedDocument,
  QueryWithHelpers,
  Schema,
  SchemaType,
  VirtualType
} from "mongoose";

const DEFAULT_LANGUAGE = "fr-FR";


export interface MultiLanguageQueryHelper {
  withLanguage: <
    ResultType extends DocType | DocType[] | null,
    DocType extends MultiLanguageInstanceMethods,
    THelpers extends MultiLanguageQueryHelper,
    TInstanceMethods extends MultiLanguageInstanceMethods,
    RawDocType = DocType,
    QueryOp = 'find',
  >(
    this: QueryWithHelpers<ResultType, DocType, THelpers, RawDocType, QueryOp, TInstanceMethods>,
    language: any,
  ) => this;
}

export interface MultiLanguageInstanceMethods {
  translate: (
    language: string,
  ) => this;
}

export interface MultiLanguageModel<DocType> {
}


export default function MongooseMultiLanguage<DocType extends { _id: any }, M extends MultiLanguageModel<DocType>>(
  _schema: Schema<DocType, M>,
  options: {
    fields: string[];
  },
) {
  const schema = _schema as Schema<DocType, M, MultiLanguageInstanceMethods, MultiLanguageQueryHelper, {}, MultiLanguageModel<DocType>>;

  options.fields.forEach((path) => {
    const transform = schema.path(path).options.transform;

    schema.path(path).options.transform = function (this, value: any) {
      value = transform ? transform.call(this, value) : value;

      const language = this._language;
      if (!language) {
        return value;
      }

      if (typeof value === "object") {
        let translation;
        if (value instanceof Map) {
          translation = value.get(language) ??
            [...value.entries()].find(([key]) => key.startsWith(language.split("-")[0]))?.[1] ??
            value.get(DEFAULT_LANGUAGE);
        } else {
          translation = value[language] ??
            Object.entries(value).find(([key]) => key.startsWith(language.split("-")[0]))?.[1] ??
            value[DEFAULT_LANGUAGE];
        }

        return translation ?? null;
      }

      return value;
    };
  });


  schema.query.withLanguage = function (this, language: undefined | string) {
    language = language || DEFAULT_LANGUAGE;

    return this.transform((docs) => {
      if (Array.isArray(docs)) {
        docs.forEach((doc) => {
          doc.translate(language);
        });
      } else if (docs) {
        docs.translate(language);
      }

      return docs;
    });
  };

  schema.methods.translate = function (language) {
    (this as any)._language = language;

    Object.entries({
      ...this.schema.paths,
      ...this.schema.virtuals
    } as {
      [key: string]: SchemaType | VirtualType<HydratedDocument<any>>
    }).map(([path, type]) => {
      const isRelationship = (type: SchemaType | VirtualType<HydratedDocument<any>>): boolean => {
        return !!(type as any).options?.ref ||
          !!(type as any).options.type?.[0]?.ref ||
          !!(type as any).options?.refPath ||
          !!(type as any).options.type?.[0]?.refPath;
      };

      if (isRelationship(type) && this.populated(path)) {
        const value = this.get(path) as MultiLanguageInstanceMethods | MultiLanguageInstanceMethods[] | null;

        if (Array.isArray(value)) {
          value.forEach((doc) => {
            doc.translate(language);
          });
        } else if (value) {
          value.translate(language);
        }
      }
    });

    return this;
  };
}
