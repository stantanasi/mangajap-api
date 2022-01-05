import db from "../db";
import { JsonApiType, JsonApiFilter, JsonApiId, JsonApiAttribute, JsonApiRelationship } from "../utils/json-api/json-api-annotations";
import MySqlModel from "../utils/mysql/mysql-model";
import { Entity, PrimaryKey, Column, OneToMany } from "../utils/mysql/mysql-annotations";
import { MySqlColumn } from "../utils/mysql/mysql-column";
import Staff, { IStaff } from "./staff.model";
import { getDownloadURL, ref, uploadString, deleteObject } from '@firebase/storage';
import { storage, uploadFile } from '../firebase-app';
import { StorageReference } from 'firebase/storage';
import { Schema, model, Types, EnforceDocument } from 'mongoose';
import JsonApiSerializer from "../utils/mongoose-jsonapi/jsonapi-serializer";

@Entity({
  database: db,
  table: "people"
})
@JsonApiType("people")
@JsonApiFilter({
  query: (query: string) => {
    return {
      where: {
        or: {
          firstName: `%${query.replace("'", "''")}%`,
          lastName: `%${query.replace("'", "''")}%`,
          pseudo: `%${query.replace("'", "''")}%`,
        },
      },
      order: [
        `CASE
          WHEN people_firstname LIKE '${query.replace("'", "''")}%' THEN 0
          WHEN people_lastname LIKE '${query.replace("'", "''")}%' THEN 1
          WHEN people_pseudo LIKE '${query.replace("'", "''")}%' THEN 2
          ELSE 3
        END`
      ],
    }
  },
})
export default class People extends MySqlModel {

  @PrimaryKey("people_id")
  @JsonApiId()
  id?: number;


  @Column("people_firstname")
  @JsonApiAttribute()
  firstName?: string;

  @Column("people_lastname")
  @JsonApiAttribute()
  lastName?: string;

  @Column("people_pseudo")
  @JsonApiAttribute()
  pseudo?: string;

  @Column("people_createdat", {
    type: MySqlColumn.DateTime,
    skipOnCreate: true,
    skipOnUpdate: true,
  })
  @JsonApiAttribute()
  createdAt?: Date;

  @Column("people_updatedat", {
    type: MySqlColumn.DateTime,
    skipOnCreate: true,
    skipOnUpdate: true,
  })
  @JsonApiAttribute()
  updatedAt?: Date;


  @OneToMany("id", Staff, "Staff", "peopleId")
  @JsonApiRelationship()
  staff?: Staff[];

  @OneToMany("id", Staff, "Staff", "peopleId", {
    where: {
      mangaId: 'NOT NULL',
    },
  })
  @JsonApiRelationship("manga-staff", "Staff")
  mangaStaff?: Staff[];

  @OneToMany("id", Staff, "Staff", "peopleId", {
    where: {
      animeId: 'NOT NULL',
    },
  })
  @JsonApiRelationship("anime-staff", "Staff")
  animeStaff?: Staff[];


  private _image?: string | null;
  @JsonApiAttribute()
  get image(): string | null | Promise<string | null> {
    return `https://firebasestorage.googleapis.com/v0/b/mangajap.appspot.com/o/${`peoples/${this.id}/images/profile.jpg`.replace(/\//g, '%2F')}?alt=media`
    return getDownloadURL(ref(storage, `peoples/${this.id}/images/profile.jpg`))
      .then(downloadURL => downloadURL)
      .catch(() => null);
  }
  set image(value: string | null | Promise<string | null>) {
    if (!(value instanceof Promise)) {
      this._image = value;
    }
  }



  async afterSave(old: People) {
    const uploadFile = (storageRef: StorageReference, file: string | null) => {
      if (file === null) {
        return deleteObject(storageRef)
          .then()
          .catch();
      } else {
        file = file.replace(/(\r\n|\n|\r)/gm, '');

        if (file.startsWith('data')) {
          return uploadString(storageRef, file, 'data_url')
            .then();
        } else {
          return uploadString(storageRef, file, 'base64')
            .then();
        }
      }
    }

    if (old._image !== undefined) {
      await uploadFile(
        ref(storage, `peoples/${this.id}/images/profile.jpg`),
        old._image,
      );
    }
  }
}


export interface IPeople {
  _id: Types.ObjectId;

  firstName: string;
  lastName: string;
  pseudo: string;
  image: string | null;

  staff?: IStaff[];
  'anime-staff'?: IStaff[];
  'manga-staff'?: IStaff[];

  createdAt: Date;
  updatedAt: Date;
}

export const PeopleSchema = new Schema<IPeople>({
  firstName: {
    type: String,
    default: ''
  },

  lastName: {
    type: String,
    default: ''
  },

  pseudo: {
    type: String,
    default: ''
  },

  image: {
    type: String,
    default: null,
  },
}, {
  id: false,
  versionKey: false,
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

PeopleSchema.virtual('staff', {
  ref: 'Staff',
  localField: '_id',
  foreignField: 'people'
});

PeopleSchema.virtual('anime-staff', {
  ref: 'Staff',
  localField: '_id',
  foreignField: 'people',
  match: {
    anime: { $exists: true, $ne: null }
  }
});

PeopleSchema.virtual('manga-staff', {
  ref: 'Staff',
  localField: '_id',
  foreignField: 'people',
  match: {
    manga: { $exists: true, $ne: null }
  }
});


PeopleSchema.pre<EnforceDocument<IPeople, {}, {}>>('save', async function () {
  if (this.isModified('image')) {
    this.image = await uploadFile(
      ref(storage, `peoples/${this._id}/images/profile.jpg`),
      this.image,
    );
  }
});


export const PeopleModel = model<IPeople>('People', PeopleSchema);


JsonApiSerializer.register('peoples', PeopleModel, {
  query: (query: string) => {
    return {
      $or: [
        {
          firstName: {
            $regex: query,
            $options: 'i',
          },
        },
        {
          lastName: {
            $regex: query,
            $options: 'i',
          },
        },
        {
          pseudo: {
            $regex: query,
            $options: 'i',
          },
        },
      ]
    };
  }
});
// TODO: order by query
