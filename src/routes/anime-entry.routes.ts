import express from "express";
import AnimeEntry from "../models/anime-entry.model";
import Anime from "../models/anime.model";
import User, { IUser } from "../models/user.model";
import { PermissionDenied } from "../utils/json-api/json-api.error";
import { isLogin } from "../utils/middlewares/middlewares";
import JsonApiQueryParser from "../utils/mongoose-jsonapi/jsonapi-query-parser";
import JsonApiSerializer from "../utils/mongoose-jsonapi/jsonapi-serializer";
import MongooseAdapter from "../utils/mongoose-jsonapi/mongoose-adapter";

const animeEntryRoutes = express.Router();

animeEntryRoutes.get('/', async (req, res, next) => {
  try {
    const { data, count } = await MongooseAdapter.find(
      AnimeEntry,
      JsonApiQueryParser.parse(req.query, AnimeEntry)
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

animeEntryRoutes.post('/', isLogin(), async (req, res, next) => {
  try {
    const data = await MongooseAdapter.create(
      AnimeEntry,
      JsonApiSerializer.deserialize(req.body)
    );

    res.json(JsonApiSerializer.serialize(data));
  } catch (err) {
    next(err);
  }
});

animeEntryRoutes.get('/:id', async (req, res, next) => {
  try {
    const data = await MongooseAdapter.findById(
      AnimeEntry,
      req.params.id,
      JsonApiQueryParser.parse(req.query, AnimeEntry)
    );

    res.json(JsonApiSerializer.serialize(data));
  } catch (err) {
    next(err);
  }
});

animeEntryRoutes.patch('/:id', isLogin(), async (req, res, next) => {
  try {
    const user: IUser = res.locals.user;
    const old = await AnimeEntry.findById(req.params.id);
    if (!user?._id?.equals(old?.user!)) {
      throw new PermissionDenied();
    }

    const data = await MongooseAdapter.update(
      AnimeEntry,
      req.params.id,
      JsonApiSerializer.deserialize(req.body)
    );

    res.json(JsonApiSerializer.serialize(data));
  } catch (err) {
    next(err);
  }
});

animeEntryRoutes.delete('/:id', isLogin(), async (req, res, next) => {
  try {
    const user: IUser = res.locals.user;
    const old = await AnimeEntry.findById(req.params.id);
    if (!user?._id?.equals(old?.user!)) {
      throw new PermissionDenied();
    }

    await MongooseAdapter.delete(
      AnimeEntry,
      req.params.id,
    );

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});


animeEntryRoutes.get('/:id/anime', async (req, res, next) => {
  try {
    const { data } = await MongooseAdapter.findRelationship(
      AnimeEntry,
      req.params.id,
      'anime',
      JsonApiQueryParser.parse(req.query, Anime),
    );

    res.json(JsonApiSerializer.serialize(data));
  } catch (err) {
    next(err);
  }
});

animeEntryRoutes.get('/:id/user', async (req, res, next) => {
  try {
    const { data } = await MongooseAdapter.findRelationship(
      AnimeEntry,
      req.params.id,
      'user',
      JsonApiQueryParser.parse(req.query, User),
    );

    res.json(JsonApiSerializer.serialize(data));
  } catch (err) {
    next(err);
  }
});

export default animeEntryRoutes
