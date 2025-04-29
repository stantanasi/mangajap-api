import { Schema } from "mongoose";

export interface ChangeTrackingInstanceMethods { }

export interface ChangeTrackingQueryHelper { }

export interface ChangeTrackingModel<DocType> { }


export default function MongooseChangeTracking<DocType extends { _id: any }, M extends ChangeTrackingModel<DocType>>(
  _schema: Schema<DocType, M>,
) {
  const schema = _schema as Schema<DocType, M, ChangeTrackingInstanceMethods, ChangeTrackingQueryHelper, {}, ChangeTrackingModel<DocType>>;
}
