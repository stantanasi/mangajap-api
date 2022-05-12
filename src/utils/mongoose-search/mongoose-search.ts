import {
  Document,
  Model,
  QueryWithHelpers,
  Schema,
} from 'mongoose';

export default function MongooseSearch<DocType extends { _id: any }, M extends SearchModel<DocType>>(
  _schema: Schema<DocType, M>,
  options: {
    fields: string[];
  },
) {
  const schema = _schema as Schema<DocType, M, SearchInstanceMethods, SearchQueryHelper>;

  schema.pre<QueryWithHelpers<DocType[], DocType, SearchQueryHelper>>('find', async function () {
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
      .addFields(options.fields.filter((field) => schema.path(field).instance === 'Mixed').reduce((acc, field) => {
        return Object.assign(acc, {
          [field]: {
            $map: {
              input: { $objectToArray: `$${field}` },
              as: 'value',
              in: '$$value.v',
            },
          },
        });
      }, {} as any))
      .match({
        $or: options.fields
          .map((field) => [query].concat(query.split(' ')).filter((word) => !!word).map((word) => {
            if (schema.path(field).instance === 'String') {
              return { [field]: { $regex: word, $options: 'i' } };
            } else {
              return { [field]: { $elemMatch: { $regex: word, $options: 'i' } } };
            }
          }))
          .reduce((acc, cur) => acc.concat(cur), []),
      })
      .addFields({
        queryScore: {
          $add: options.fields
            .map((field, i1, arr1) => [query].concat(query.split(' ')).filter((word) => !!word).map((word, i2, arr2) => {
              const coef = (arr1.length - i1) * (arr2.length - i2);
              if (schema.path(field).instance === 'String') {
                return [
                  { $cond: [{ $regexMatch: { input: `$${field}`, regex: `^${word}$`, options: 'i' } }, 100 * coef, 0] },
                  { $cond: [{ $regexMatch: { input: `$${field}`, regex: `^${word}`, options: 'i' } }, 90 * coef, 0] },
                  { $cond: [{ $regexMatch: { input: `$${field}`, regex: `\b${word}\b`, options: 'i' } }, 70 * coef, 0] },
                  { $cond: [{ $regexMatch: { input: `$${field}`, regex: `\b${word}`, options: 'i' } }, 50 * coef, 0] },
                ];
              } else {
                return [
                  {
                    $reduce: {
                      input: `$${field}`,
                      initialValue: 0,
                      in: {
                        $add: [
                          "$$value",
                          { $cond: [{ $regexMatch: { input: '$$this', regex: `^${word}$`, options: 'i' } }, 100 * coef, 0] },
                          { $cond: [{ $regexMatch: { input: '$$this', regex: `^${word}`, options: 'i' } }, 90 * coef, 0] },
                          { $cond: [{ $regexMatch: { input: '$$this', regex: `\b${word}\b`, options: 'i' } }, 70 * coef, 0] },
                          { $cond: [{ $regexMatch: { input: '$$this', regex: `\b${word}`, options: 'i' } }, 50 * coef, 0] },
                        ],
                      },
                    },
                  },
                ];
              }
            }))
            .reduce((acc, cur) => acc.concat(cur), [])
            .reduce((acc, cur) => acc.concat(cur), [] as any[]),
        },
      })
      .sort(Object.assign({
        queryScore: -1,
      }, this.getOptions().sort));

    const limit = this.getOptions().limit;
    if (limit) {
      aggregate.limit(limit);
    }

    const ids = await aggregate.then((docs) => docs.map((doc) => doc._id));

    this
      .merge({ _id: { $in: ids } })
      .transformAt(0, (docs: DocType[]) => {
        return docs.sort((a, b) => ids.findIndex((id) => id.toString() == a._id) - ids.findIndex((id) => id.toString() == b._id));
      });
  });


  schema.query.transformAt = function (index, fn) {
    (this as any)._transforms.splice(index, 0, fn);
    return this as any;
  }
}


export interface SearchModel<T> extends Model<T, SearchQueryHelper, SearchInstanceMethods> {
}

export interface SearchInstanceMethods extends Document {
}

export interface SearchQueryHelper {
  transformAt: <MappedType, ResultType, DocType>(
    this: QueryWithHelpers<ResultType, DocType, SearchQueryHelper>,
    index: number,
    fn: (doc: ResultType) => MappedType,
  ) => QueryWithHelpers<MappedType, DocType, SearchQueryHelper>;
}
