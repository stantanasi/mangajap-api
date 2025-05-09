import { Document, QueryOptions, SaveOptions, Schema } from 'mongoose';
import Change, { IChange } from '../../models/change.model';

type ChangeSaveOptions = SaveOptions & {
  user: string;
};

type ChangeQueryOptions = QueryOptions & {
  user: string;
}


export interface ChangeTrackingInstanceMethods {
  save: (options?: ChangeSaveOptions) => ReturnType<Document['save']>;

  deleteOne(options?: ChangeQueryOptions): ReturnType<Document['deleteOne']>;
}

export interface ChangeTrackingQueryHelper { }

export interface ChangeTrackingModel<DocType> { }


export default function MongooseChangeTracking<DocType extends { _id: any }, M extends ChangeTrackingModel<DocType>>(
  _schema: Schema<DocType, M>,
) {
  const schema = _schema as Schema<DocType, M, ChangeTrackingInstanceMethods, ChangeTrackingQueryHelper, {}, ChangeTrackingModel<DocType>>;


  const computeBeforeAfter = (
    oldData: DocType,
    newData: DocType,
  ): IChange['changes'] => {
    const before: IChange['changes']['before'] = {};
    const after: IChange['changes']['after'] = {};

    for (const key in newData) {
      if (['createdAt', 'updatedAt'].includes(key)) continue
      if (JSON.stringify(oldData[key]) === JSON.stringify(newData[key])) continue

      before[key] = oldData[key];
      after[key] = newData[key];
    }

    return {
      before: before,
      after: after,
    };
  };


  schema.pre('save', async function (_next, options) {
    if (this.isNew) {
      await new Change({
        action: 'create',
        changes: {
          after: this.toJSON(),
        },

        document: this._id,
        documentModel: this.model().modelName,
        user: (options as ChangeSaveOptions).user,
      }).save();
    } else {
      const original = await this.model().findById(this._id);
      if (!original) return

      const { before, after } = computeBeforeAfter(
        original.toJSON() as DocType,
        this.toJSON() as DocType
      );
      if (!before || Object.keys(before).length === 0) return

      await new Change({
        action: 'update',
        changes: {
          before: before,
          after: after,
        },

        document: this._id,
        documentModel: this.model().modelName,
        user: (options as ChangeSaveOptions).user,
      }).save();
    }
  });

  schema.pre('deleteOne', { document: true, query: false }, async function (_next, options) {
    await new Change({
      action: 'delete',
      changes: {
        before: this.toJSON(),
      },

      document: this._id,
      documentModel: this.model().modelName,
      user: (options as ChangeQueryOptions).user,
    }).save();
  });
}
