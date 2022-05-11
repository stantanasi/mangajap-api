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

  schema.pre('find', async function () {
    const iterate = (obj: any): { key: string, value: any }[] => {
      return Object.keys(obj).reduce((acc, key) => {
        acc = acc.concat({ key: key, value: obj[key] });

        if (typeof obj[key] === 'object' && obj[key] !== null) {
          acc = acc.concat(iterate(obj[key]));
        }

        return acc;
      }, [] as any[]);
    };

    const query: string | undefined = iterate(this.getFilter())
      .find((filter) => filter.key === '$search')
      ?.value;
    if (!query) return;

    const aggregate = this.model.aggregate()
      .match({
        $or: options.fields
          .map((field) => [query].concat(query.split(' ')).filter((word) => !!word).map((word) => {
            return { [field]: { $regex: word, $options: 'i' } };
          }))
          .reduce((acc, cur) => acc.concat(cur), []),
      })
      .addFields({
        queryScore: {
          $add: options.fields
            .map((field, i1, arr1) => [query].concat(query.split(' ')).filter((word) => !!word).map((word, i2, arr2) => {
              const coef = (arr1.length - i1) * (arr2.length - i2);
              return [
                { $cond: [{ $regexMatch: { input: `$${field}`, regex: `^${word}$`, options: 'i' } }, 100 * coef, 0] },
                { $cond: [{ $regexMatch: { input: `$${field}`, regex: `^${word}`, options: 'i' } }, 90 * coef, 0] },
                { $cond: [{ $regexMatch: { input: `$${field}`, regex: `\b${word}\b`, options: 'i' } }, 70 * coef, 0] },
                { $cond: [{ $regexMatch: { input: `$${field}`, regex: `\b${word}`, options: 'i' } }, 50 * coef, 0] },
              ];
            }))
            .reduce((acc, cur) => acc.concat(cur), [])
            .reduce((acc, cur) => acc.concat(cur), []),
        },
      })
      .sort({
        queryScore: -1,
      });

    const limit = this.getOptions().limit;
    if (limit) {
      aggregate.limit(limit);
    }

    const ids = await aggregate.then((docs) => docs.map((doc) => doc._id));

    this
      .merge({ _id: { $in: ids } })
      .transform((docs: DocType[]) => {
        return docs.sort((a, b) => ids.findIndex((id) => id.toString() == a._id) - ids.findIndex((id) => id.toString() == b._id));
      });
  });
}


export interface SearchModel<T> extends Model<T, SearchQueryHelper, SearchInstanceMethods> {
}

export interface SearchInstanceMethods extends Document {
}

export interface SearchQueryHelper {
}
