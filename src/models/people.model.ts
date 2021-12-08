import db from "../db";
import { JsonApiType, JsonApiFilter, JsonApiId, JsonApiAttribute, JsonApiRelationship } from "../utils/json-api/json-api-annotations";
import MySqlModel from "../utils/mysql/mysql-model";
import { Entity, PrimaryKey, Column, OneToMany } from "../utils/mysql/mysql-annotations";
import { MySqlColumn } from "../utils/mysql/mysql-column";
import Staff from "./staff.model";
import { getDownloadURL, ref, uploadString, deleteObject } from '@firebase/storage';
import { storage } from '../firebase-app';
import { StorageReference } from 'firebase/storage';
import { Schema, model } from 'mongoose';

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


  async create(): Promise<this> {
    const model = await super.create()
    await PeopleModel.create(model.toMongoModel());
    return model;
  }

  async update(): Promise<this> {
    const model = await super.update()
    await PeopleModel.findByIdAndUpdate(model.id, {
      $set: model.toMongoModel(),
    });
    return model;
  }

  toMongoModel(): IPeople {
    return {
      _id: this.id!.toString(),

      firstName: this.firstName!.toString(),
      lastName: this.lastName!.toString(),
      pseudo: this.pseudo!.toString(),

      createdAt: this.createdAt!,
      updatedAt: this.updatedAt!,
    }
  }
}


interface IPeople {
  _id: string;

  firstName: string;
  lastName: string;
  pseudo: string;

  createdAt: Date;
  updatedAt: Date;
}

const PeopleSchema = new Schema<IPeople>({
  _id: {
    type: String,
    required: true
  },


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


  createdAt: {
    type: Date,
    default: new Date()
  },

  updatedAt: {
    type: Date,
    default: new Date()
  },
}, {
  id: false,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

PeopleSchema.virtual('staff', {
  ref: 'Staff',
  localField: '_id',
  foreignField: 'people'
});

PeopleSchema.virtual('animeStaff', {
  ref: 'Staff',
  localField: '_id',
  foreignField: 'people',
  match: {
    anime: { $exists: true, $ne: null }
  }
});

PeopleSchema.virtual('mangaStaff', {
  ref: 'Staff',
  localField: '_id',
  foreignField: 'people',
  match: {
    manga: { $exists: true, $ne: null }
  }
});


export const PeopleModel = model<IPeople>('People', PeopleSchema);
