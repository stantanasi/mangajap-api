import express from "express";
import MangaEntry from "../models/manga-entry.model";
import Manga from "../models/manga.model";
import User, { IUser } from "../models/user.model";
import { PermissionDenied } from "../utils/json-api/json-api.error";
import { isLogin } from "../utils/middlewares/middlewares";
import JsonApiQueryParser from "../utils/mongoose-jsonapi/jsonapi-query-parser";
import JsonApiSerializer from "../utils/mongoose-jsonapi/jsonapi-serializer";
import MongooseAdapter from "../utils/mongoose-jsonapi/mongoose-adapter";

const mangaEntryRoutes = express.Router();

mangaEntryRoutes.get('/', async (req, res, next) => {
  try {
    const { data, count } = await MongooseAdapter.find(
      MangaEntry,
      JsonApiQueryParser.parse(req.query, MangaEntry)
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
      MangaEntry,
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
      MangaEntry,
      req.params.id,
      JsonApiQueryParser.parse(req.query, MangaEntry)
    );

    res.status(data ? 200 : 404).json(JsonApiSerializer.serialize(data));
  } catch (err) {
    next(err);
  }
});

mangaEntryRoutes.patch('/:id', isLogin(), async (req, res, next) => {
  try {
    const user: IUser = res.locals.user;
    const old = await MangaEntry.findById(req.params.id);
    if (user?._id !== old?.user) {
      throw new PermissionDenied();
    }

    const data = await MongooseAdapter.update(
      MangaEntry,
      req.params.id,
      JsonApiSerializer.deserialize(req.body)
    );

    res.json(JsonApiSerializer.serialize(data));
  } catch (err) {
    next(err);
  }
});

mangaEntryRoutes.delete('/:id', isLogin(), async (req, res, next) => {
  try {
    const user: IUser = res.locals.user;
    const old = await MangaEntry.findById(req.params.id);
    if (user?._id !== old?.user) {
      throw new PermissionDenied();
    }

    await MongooseAdapter.delete(
      MangaEntry,
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
      MangaEntry,
      req.params.id,
      'manga',
      JsonApiQueryParser.parse(req.query, Manga),
    );

    res.json(JsonApiSerializer.serialize(data));
  } catch (err) {
    next(err);
  }
});

mangaEntryRoutes.get('/:id/user', async (req, res, next) => {
  try {
    const { data } = await MongooseAdapter.findRelationship(
      MangaEntry,
      req.params.id,
      'user',
      JsonApiQueryParser.parse(req.query, User),
    );

    res.json(JsonApiSerializer.serialize(data));
  } catch (err) {
    next(err);
  }
});

export default mangaEntryRoutes
