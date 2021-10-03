import db from "../db";
import { JsonApiType, JsonApiFilter, JsonApiId, JsonApiAttribute, JsonApiRelationship } from "../utils/json-api/json-api-annotations";
import MySqlModel from "../utils/mysql/mysql-model";
import { Entity, PrimaryKey, Column, OneToMany } from "../utils/mysql/mysql-annotations";
import { MySqlColumn } from "../utils/mysql/mysql-column";
import Staff from "./staff.model";
import { getDownloadURL, ref, uploadString, deleteObject } from '@firebase/storage';
import { storage } from '../firebase-app';

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


  @JsonApiAttribute()
  get image(): string | null | Promise<string | null> {
    return `https://firebasestorage.googleapis.com/v0/b/mangajap.appspot.com/o/${`peoples/${this.id}/images/profile.jpg`.replace(/\//g, '%2F')}?alt=media`
    return (async () => getDownloadURL(ref(storage, `peoples/${this.id}/images/profile.jpg`))
      .then(downloadURL => downloadURL)
      .catch(error => null)
    )();
  }
  set image(value: string | null | Promise<string | null>) {
    const storageRef = ref(storage, `peoples/${this.id}/images/profile.jpg`);

    if (value === null) {
      deleteObject(storageRef)
        .then()
        .catch();
    } else if (!(value instanceof Promise)) {
      if (value.startsWith('data')) {
        uploadString(storageRef, value, 'data_url')
          .then();
      } else {
        uploadString(storageRef, value, 'base64')
          .then();
      }
    }
  }
}