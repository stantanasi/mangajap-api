import db from "../db";
import { JsonApiAttribute, JsonApiFilter, JsonApiId, JsonApiRelationship, JsonApiType } from "../utils/json-api/json-api-annotations";
import JsonApiError from "../utils/json-api/json-api.error";
import MySqlModel from "../utils/mysql/mysql-model";
import { BelongsTo, Column, Entity, PrimaryKey } from "../utils/mysql/mysql-annotations";
import { MySqlColumn } from "../utils/mysql/mysql-column";
import Anime from "./anime.model";
import User from "./user.model";

@Entity({
  database: db,
  table: "animeentry"
})
@JsonApiType("animeEntries", {
  endpoint: "anime-entries"
})
@JsonApiFilter({
  status: (status: string) => {
    return {
      where: {
        status: status,
      },
    }
  },
})
export default class AnimeEntry extends MySqlModel {

  @PrimaryKey("animeentry_id")
  @JsonApiId()
  id?: number;

  
  @Column("animeentry_userid", {
    skipOnUpdate: true,
  })
  userId?: number;

  @Column("animeentry_animeid", {
    skipOnUpdate: true,
  })
  animeId?: number;


  @Column("animeentry_isadd", {
    type: MySqlColumn.Boolean
  })
  @JsonApiAttribute()
  isAdd?: boolean;

  @Column("animeentry_isfavorites", {
    type: MySqlColumn.Boolean
  })
  @JsonApiAttribute()
  isFavorites?: boolean;

  @Column("animeentry_isprivate", {
    type: MySqlColumn.Boolean
  })
  @JsonApiAttribute()
  isPrivate?: boolean;

  @Column("animeentry_status")
  @JsonApiAttribute()
  status?: string;

  @Column("animeentry_episodeswatch")
  @JsonApiAttribute()
  episodesWatch?: number;

  @Column("animeentry_rating")
  @JsonApiAttribute()
  rating?: number;

  @Column("animeentry_startedat", {
    type: MySqlColumn.DateTime
  })
  @JsonApiAttribute()
  startedAt?: Date;

  @Column("animeentry_finishedat", {
    type: MySqlColumn.DateTime
  })
  @JsonApiAttribute()
  finishedAt?: Date;

  @Column("animeentry_createdat", {
    type: MySqlColumn.DateTime,
    skipOnCreate: true,
    skipOnUpdate: true,
  })
  @JsonApiAttribute()
  createdAt?: Date;

  @Column("animeentry_updatedat", {
    type: MySqlColumn.DateTime,
    skipOnCreate: true,
    skipOnUpdate: true,
  })
  @JsonApiAttribute()
  updatedAt?: Date;


  @BelongsTo("animeId", Anime, "Anime", "id")
  @JsonApiRelationship()
  anime?: Anime;

  @BelongsTo("userId", User, "User", "id")
  @JsonApiRelationship()
  user?: User;



  async beforeCreate() {
    const animeEntry = await AnimeEntry.findOne({
      where: {
        userId: this.userId?.toString() || "",
        animeId: this.animeId?.toString() || "",
      }
    });

    if (animeEntry) {
      throw new JsonApiError({
        title: "Already existing"
      })
    }
  }
}