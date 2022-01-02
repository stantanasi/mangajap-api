import express from "express";
import { MangaEntryModel } from "../models/manga-entry.model";
import { MangaModel } from "../models/manga.model";
import { UserModel } from "../models/user.model";
import { PermissionDenied } from "../utils/json-api/json-api.error";
import { isLogin } from "../utils/middlewares/middlewares";
import JsonApiQueryParser from "../utils/mongoose-jsonapi/jsonapi-query-parser";
import JsonApiSerializer from "../utils/mongoose-jsonapi/jsonapi-serializer";
import MongooseAdapter from "../utils/mongoose-jsonapi/mongoose-adapter";

const mangaEntryRoutes = express.Router();

mangaEntryRoutes.get('/', async (req, res, next) => {
  try {
    const { data, count } = await MongooseAdapter.find(
      MangaEntryModel,
      JsonApiQueryParser.parse(req.query, MangaEntryModel)
    );

    res.json(JsonApiSerializer.serialize(data, {
      meta: {
        count: count
      },
      pagination: {
        url: req.originalUrl,
        count: count,
        query: req.query,
      },
    }));
  } catch (err) {
    next(err);
  }
});

mangaEntryRoutes.post('/', isLogin(), async (req, res, next) => {
  try {
    const data = await MongooseAdapter.create(
      MangaEntryModel,
      JsonApiSerializer.deserialize(req.body)
    );

    res.json(JsonApiSerializer.serialize(data));
  } catch (err) {
    next(err);
  }
});

mangaEntryRoutes.get('/:id', async (req, res, next) => {
  try {
    const data = await MongooseAdapter.findById(
      MangaEntryModel,
      req.params.id,
      JsonApiQueryParser.parse(req.query, MangaEntryModel)
    );

    res.json(JsonApiSerializer.serialize(data));
  } catch (err) {
    next(err);
  }
});

mangaEntryRoutes.patch('/:id', isLogin(), async (req, res, next) => {
  try {
    let bearerToken = req.headers.authorization;
    if (bearerToken?.startsWith('Bearer ')) {
      bearerToken = bearerToken.substring(7);
    }

    const user = await UserModel.findOne({
      uid: bearerToken,
    });
    const old = await MangaEntryModel.findById(req.params.id);
    if (user?._id !== old?.user) {
      throw new PermissionDenied();
    }

    const data = await MongooseAdapter.update(
      MangaEntryModel,
      req.params.id,
      JsonApiSerializer.deserialize(req.body)
    );

    res.json(JsonApiSerializer.serialize(data));

    // TODO
    // if (user.isAdmin) {
    //   newMangaEntry.getRelated('manga')
    //     .then(response => {
    //       if (response && !Array.isArray(response)) {
    //         const manga = response as Manga;
    //         const newManga = new Manga();
    //         newManga.id = manga.id;
  
    //         if (
    //           (newMangaEntry.volumesRead || 0) > (manga.volumeCount || 0) ||
    //           (newMangaEntry.chaptersRead || 0) > (manga.chapterCount || 0)
    //         ) {
    //           if ((newMangaEntry.volumesRead || 0) > (manga.volumeCount || 0)) {
    //             for (let number = (manga.volumeCount || 0) + 1; number <= (newMangaEntry.volumesRead || 0); number++) {
    //               const volume = new Volume();
    //               volume.mangaId = manga.id;
    //               volume.number = number;
    //               volume.create()
    //                 .then(() => { })
    //                 .catch(() => { });
    //             }
    //             newManga.volumeCount = newMangaEntry.volumesRead;
    //           }
  
    //           if ((newMangaEntry.chaptersRead || 0) > (manga.chapterCount || 0)) {
    //             newManga.chapterCount = newMangaEntry.chaptersRead;
    //           }
  
    //           newManga.update()
    //             .then(() => { })
    //             .catch(() => { });
    //         }
    //       }
    //     })
    //     .catch(err => console.log(err));
    // }
  } catch (err) {
    next(err);
  }
});

mangaEntryRoutes.delete('/:id', isLogin(), async (req, res, next) => {
  try {
    let bearerToken = req.headers.authorization;
    if (bearerToken?.startsWith('Bearer ')) {
      bearerToken = bearerToken.substring(7);
    }

    const user = await UserModel.findOne({
      uid: bearerToken,
    });
    const old = await MangaEntryModel.findById(req.params.id);
    if (user?.id !== old?.user) {
      throw new PermissionDenied();
    }

    await MongooseAdapter.delete(
      MangaEntryModel,
      req.params.id,
    );

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});


mangaEntryRoutes.get('/:id/manga', async (req, res, next) => {
  try {
    const { data } = await MongooseAdapter.findRelationship(
      MangaEntryModel,
      req.params.id,
      'manga',
      JsonApiQueryParser.parse(req.query, MangaModel),
    );

    res.json(JsonApiSerializer.serialize(data));
  } catch (err) {
    next(err);
  }
});

mangaEntryRoutes.get('/:id/user', async (req, res, next) => {
  try {
    const { data } = await MongooseAdapter.findRelationship(
      MangaEntryModel,
      req.params.id,
      'user',
      JsonApiQueryParser.parse(req.query, UserModel),
    );

    res.json(JsonApiSerializer.serialize(data));
  } catch (err) {
    next(err);
  }
});

export default mangaEntryRoutes
