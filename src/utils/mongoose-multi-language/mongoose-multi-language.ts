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
}
