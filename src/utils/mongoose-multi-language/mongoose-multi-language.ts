import {
  HydratedDocument,
  QueryWithHelpers,
  Schema,
  SchemaType,
  VirtualType
} from "mongoose";

const DEFAULT_LANGUAGE = "fr-FR";

const LANGUAGES: Record<string, string> = {
  fr: "fr-FR",
  en: "en-US",
  es: "es-ES",
  de: "de-DE",
  it: "it-IT",
  ja: "ja-JP",
  zh: "zh-CN",
  pt: "pt-BR",
  nl: "nl-NL",
  ru: "ru-RU",
  ar: "ar-SA",
  ko: "ko-KR",
  sv: "sv-SE",
  no: "no-NO",
  da: "da-DK",
  fi: "fi-FI",
  pl: "pl-PL",
  tr: "tr-TR",
  cs: "cs-CZ",
  ro: "ro-RO",
  hu: "hu-HU",
  el: "el-GR",
  th: "th-TH",
  vi: "vi-VN",
  id: "id-ID",
  ms: "ms-MY",
  hi: "hi-IN",
  bn: "bn-BD",
  ta: "ta-IN",
  ml: "ml-IN",
  kn: "kn-IN",
  mr: "mr-IN",
  gu: "gu-IN",
  te: "te-IN",
  or: "or-IN",
  pa: "pa-IN",
  ur: "ur-PK",
  he: "he-IL",
  sw: "sw-KE",
  am: "am-ET",
  ne: "ne-NP",
  si: "si-LK"
};

const getLanguage = (language: string | undefined): string => {
  if (!language) return DEFAULT_LANGUAGE;

  if (/^[a-z]{2}-[A-Z]{2}$/.test(language)) {
    return language;
  }

  if (/^[a-z]{2}$/.test(language)) {
    return LANGUAGES[language] || DEFAULT_LANGUAGE;
  }

  return DEFAULT_LANGUAGE;
}


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
  fromLanguage: (
    language: any,
  ) => ((doc: HydratedDocument<DocType>, path: string, value: any) => any);
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
          translation = value.get(language) ?? value.get(DEFAULT_LANGUAGE);
        } else {
          translation = value[language] ?? value[DEFAULT_LANGUAGE];
        }

        return translation ?? null;
      }

      return value;
    };
  });


  schema.statics.fromLanguage = function (language: string | undefined) {
    language = getLanguage(language);

    return (doc, path, value) => {
      if (options.fields.includes(path)) {
        doc.set(`${path}.${language}`, value);
      } else {
        doc.set(path, value);
      };
    };
  };

  schema.query.withLanguage = function (this, language: string | undefined) {
    language = getLanguage(language);

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
    (this as any)._language = getLanguage(language);

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
