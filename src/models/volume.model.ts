import db from "../db";
import { JsonApiId, JsonApiAttribute, JsonApiType, JsonApiRelationship } from "../utils/json-api/json-api-annotations";
import MySqlModel from "../utils/mysql/mysql-model";
import { Entity, PrimaryKey, Column, BelongsTo } from "../utils/mysql/mysql-annotations";
import { MySqlColumn } from "../utils/mysql/mysql-column";
import Manga, { IManga } from "./manga.model";
import { getDownloadURL, ref, uploadString, deleteObject } from '@firebase/storage';
import { storage } from '../firebase-app';
import { StorageReference } from 'firebase/storage';
import { Schema, model } from 'mongoose';
import JsonApiSerializer from "../utils/mongoose-jsonapi/jsonapi-serializer";

@Entity({
  database: db,
  table: "volume"
})
@JsonApiType("volumes")
export default class Volume extends MySqlModel {

  @PrimaryKey("volume_id")
  @JsonApiId()
  id?: number;


  @Column("volume_mangaid")
  mangaId?: number;


  @Column("volume_title_fr")
  @JsonApiAttribute("titles.fr")
  title_fr?: string;

  @Column("volume_title_en")
  @JsonApiAttribute("titles.en")
  title_en?: string;

  @Column("volume_title_en_jp")
  @JsonApiAttribute("titles.en_jp")
  title_en_jp?: string;

  @Column("volume_title_ja_jp")
  @JsonApiAttribute("titles.ja_jp")
  title_ja_jp?: string;

  @Column("volume_number")
  @JsonApiAttribute()
  number?: number;

  @Column("volume_startchapter")
  @JsonApiAttribute()
  startChapter?: number;

  @Column("volume_endchapter")
  @JsonApiAttribute()
  endChapter?: number;

  @Column("volume_published", {
    type: MySqlColumn.Date
  })
  @JsonApiAttribute()
  published?: Date;

  @Column("volume_createdat", {
    type: MySqlColumn.DateTime,
    skipOnCreate: true,
    skipOnUpdate: true,
  })
  @JsonApiAttribute()
  createdAt?: Date;

  @Column("volume_updatedat", {
    type: MySqlColumn.DateTime,
    skipOnCreate: true,
    skipOnUpdate: true,
  })
  @JsonApiAttribute()
  updatedAt?: Date;


  @BelongsTo("mangaId", Manga, "Manga", "id")
  @JsonApiRelationship()
  manga?: Manga;


  private _coverImage?: string | null;
  @JsonApiAttribute()
  get coverImage(): string | null | Promise<string | null> {
    return `https://firebasestorage.googleapis.com/v0/b/mangajap.appspot.com/o/${`manga/${this.mangaId}/volumes/${this.id}/images/cover.jpg`.replace(/\//g, '%2F')}?alt=media`
    return getDownloadURL(ref(storage, `manga/${this.mangaId}/volumes/${this.id}/images/cover.jpg`))
      .then(downloadURL => downloadURL)
      .catch(() => null);
  }
  set coverImage(value: string | null | Promise<string | null>) {
    if (!(value instanceof Promise)) {
      this._coverImage = value;
    }
  }



  async afterSave(old: Volume) {
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

    if (old._coverImage !== undefined) {
      await uploadFile(
        ref(storage, `manga/${this.mangaId}/volumes/${this.id}/images/cover.jpg`),
        old._coverImage,
      );
    }
  }
}


export interface IVolume {
  _id: string;

  titles: {
    [language: string]: string;
  };
  number: number;
  startChapter: number | null;
  endChapter: number | null;
  published: Date | null;
  coverImage: string | null;

  manga: string & IManga;

  createdAt: Date;
  updatedAt: Date;
}

export const VolumeSchema = new Schema<IVolume>({
  _id: {
    type: String,
    required: true
  },


  titles: {
    type: Schema.Types.Mixed,
    default: {}
  },

  number: {
    type: Number,
    required: true
  },

  startChapter: {
    type: Number,
    default: null
  },

  endChapter: {
    type: Number,
    default: null
  },

  published: {
    type: Date,
    default: null,
    transform: function (this, val) {
      return val?.toISOString().slice(0, 10) ?? null;
    },
  },


  manga: {
    type: String,
    ref: 'Manga',
    required: true
  },
}, {
  id: false,
  versionKey: false,
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

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

VolumeSchema.virtual('coverImage')
  .get(function (this: IVolume) {
    return `https://firebasestorage.googleapis.com/v0/b/mangajap.appspot.com/o/${`manga/${this.manga}/volumes/${this._id}/images/cover.jpg`.replace(/\//g, '%2F')}?alt=media`
    return getDownloadURL(ref(storage, `manga/${this.manga}/volumes/${this._id}/images/cover.jpg`))
      .then(downloadURL => downloadURL)
      .catch(() => null);
  })
  .set(function (this: IVolume, value: string) {
    uploadFile(
      ref(storage, `manga/${this.manga}/volumes/${this._id}/images/cover.jpg`),
      value,
    ).then();
  });


export const VolumeModel = model<IVolume>('Volume', VolumeSchema);


JsonApiSerializer.register('volumes', VolumeModel);
