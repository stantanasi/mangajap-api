import fs from "fs";
import db from "../db";
import { JsonApiType, JsonApiFilter, JsonApiId, JsonApiAttribute, JsonApiRelationship } from "../utils/json-api/json-api-annotations";
import MySqlModel from "../utils/mysql/mysql-model";
import { Entity, PrimaryKey, Column, OneToMany } from "../utils/mysql/mysql-annotations";
import { MySqlColumn } from "../utils/mysql/mysql-column";
import Staff from "./staff.model";

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


  @JsonApiAttribute() // TODO: Structuration des images (manga, anime, users, people, etc)
  get image(): string | null {
    if (fs.existsSync(`./peoples/${this.id}/image.jpg`)) {
      return `http://mangajap.000webhostapp.com/images/peoples/${this.id}/image.jpg`
    } else {
      return null
    }
  }
  set image(value: string | null) {
    if (value === null) {
      if (fs.existsSync(`./peoples/${this.id}/image.jpg`)) {
        fs.unlinkSync(`./peoples/${this.id}/image.jpg`)
      }
    } else {
      if (value.startsWith('data')) {
        value = value.split(',')[1];
      }

      fs.writeFileSync(`./peoples/${this.id}/image.jpg`, value, {
        encoding: 'base64'
      })
    }
  }
}