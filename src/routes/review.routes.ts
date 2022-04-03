import express from "express";
import Anime from "../models/anime.model";
import Manga from "../models/manga.model";
import Review from "../models/review.model";
import User, { IUser } from "../models/user.model";
import { PermissionDenied } from "../utils/json-api/json-api.error";
import { isLogin } from "../utils/middlewares/middlewares";
import JsonApiQueryParser from "../utils/mongoose-jsonapi/jsonapi-query-parser";
import JsonApiSerializer from "../utils/mongoose-jsonapi/jsonapi-serializer";
import MongooseAdapter from "../utils/mongoose-jsonapi/mongoose-adapter";

const reviewRoutes = express.Router();

reviewRoutes.get('/', async (req, res, next) => {
  try {
    const { data, count } = await MongooseAdapter.find(
      Review,
      JsonApiQueryParser.parse(req.query, Review)
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

reviewRoutes.post('/', isLogin(), async (req, res, next) => {
  try {
    const data = await MongooseAdapter.create(
      Review,
      JsonApiSerializer.deserialize(req.body)
    );

    res.json(JsonApiSerializer.serialize(data));
  } catch (err) {
    next(err);
  }
});

reviewRoutes.get('/:id', async (req, res, next) => {
  try {
    const data = await MongooseAdapter.findById(
      Review,
      req.params.id,
      JsonApiQueryParser.parse(req.query, Review)
    );

    res.status(data ? 200 : 404).json(JsonApiSerializer.serialize(data));
  } catch (err) {
    next(err);
  }
});

reviewRoutes.patch('/:id', isLogin(), async (req, res, next) => {
  try {
    const user: IUser = res.locals.user;
    const old = await Review.findById(req.params.id);
    if (user?._id !== old?.user) {
      throw new PermissionDenied();
    }

    const data = await MongooseAdapter.update(
      Review,
      req.params.id,
      JsonApiSerializer.deserialize(req.body)
    );

    res.json(JsonApiSerializer.serialize(data));
  } catch (err) {
    next(err);
  }
});

reviewRoutes.delete('/:id', isLogin(), async (req, res, next) => {
  try {
    const user: IUser = res.locals.user;
    const old = await Review.findById(req.params.id);
    if (user?._id !== old?.user) {
      throw new PermissionDenied();
    }

    await MongooseAdapter.delete(
      Review,
      req.params.id,
    );

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});


reviewRoutes.get('/:id/user', async (req, res, next) => {
  try {
    const { data } = await MongooseAdapter.findRelationship(
      Review,
      req.params.id,
      'user',
      JsonApiQueryParser.parse(req.query, User),
    );

    res.json(JsonApiSerializer.serialize(data));
  } catch (err) {
    next(err);
  }
});

reviewRoutes.get('/:id/manga', async (req, res, next) => {
  try {
    const { data } = await MongooseAdapter.findRelationship(
      Review,
      req.params.id,
      'manga',
      JsonApiQueryParser.parse(req.query, Manga),
    );

    res.json(JsonApiSerializer.serialize(data));
  } catch (err) {
    next(err);
  }
});

reviewRoutes.get('/:id/anime', async (req, res, next) => {
  try {
    const { data } = await MongooseAdapter.findRelationship(
      Review,
      req.params.id,
      'anime',
      JsonApiQueryParser.parse(req.query, Anime),
    );

    res.json(JsonApiSerializer.serialize(data));
  } catch (err) {
    next(err);
  }
});

export default reviewRoutes
