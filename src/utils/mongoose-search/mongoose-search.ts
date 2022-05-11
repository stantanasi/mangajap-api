import {
  Document,
  Model,
  Schema,
} from 'mongoose';

export default function MongooseSearch<DocType extends { _id: any }, M extends SearchModel<DocType>>(
  _schema: Schema<DocType, M>,
  options: {
    fields: string[];
  },
) {
  const schema = _schema as Schema<DocType, M, {}, {}>;
}


export interface SearchModel<T> extends Model<T, SearchQueryHelper, SearchInstanceMethods> {
}

export interface SearchInstanceMethods extends Document {
}

export interface SearchQueryHelper {
}
