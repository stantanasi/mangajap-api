import {
  Schema
} from "mongoose";

const DEFAULT_LANGUAGE = "fr-FR";


export interface MultiLanguageQueryHelper {
}

export interface MultiLanguageInstanceMethods {
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
}
