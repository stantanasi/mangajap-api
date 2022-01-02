import express from "express";
import { AnimeModel } from "../models/anime.model";
import { MangaModel } from "../models/manga.model";
import { ReviewModel } from "../models/review.model";
import { UserModel } from "../models/user.model";
import { PermissionDenied } from "../utils/json-api/json-api.error";
import { isLogin } from "../utils/middlewares/middlewares";
import JsonApiQueryParser from "../utils/mongoose-jsonapi/jsonapi-query-parser";
import JsonApiSerializer from "../utils/mongoose-jsonapi/jsonapi-serializer";
import MongooseAdapter from "../utils/mongoose-jsonapi/mongoose-adapter";

const reviewRoutes = express.Router();

reviewRoutes.get('/', async (req, res, next) => {
  try {
    const { data, count } = await MongooseAdapter.find(
      ReviewModel,
      JsonApiQueryParser.parse(req.query, ReviewModel)
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
      ReviewModel,
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
      ReviewModel,
      req.params.id,
      JsonApiQueryParser.parse(req.query, ReviewModel)
    );

    res.json(JsonApiSerializer.serialize(data));
  } catch (err) {
    next(err);
  }
});

reviewRoutes.patch('/:id', isLogin(), async (req, res, next) => {
  try {
    let bearerToken = req.headers.authorization;
    if (bearerToken?.startsWith('Bearer ')) {
      bearerToken = bearerToken.substring(7);
    }

    const user = await UserModel.findOne({
      uid: bearerToken,
    });
    const old = await ReviewModel.findById(req.params.id);
    if (user?.id !== old?.user) {
      throw new PermissionDenied();
    }

    const data = await MongooseAdapter.update(
      ReviewModel,
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
    let bearerToken = req.headers.authorization;
    if (bearerToken?.startsWith('Bearer ')) {
      bearerToken = bearerToken.substring(7);
    }

    const user = await UserModel.findOne({
      uid: bearerToken,
    });
    const old = await ReviewModel.findById(req.params.id);
    if (user?.id !== old?.user) {
      throw new PermissionDenied();
    }

    await MongooseAdapter.delete(
      ReviewModel,
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
      ReviewModel,
      req.params.id,
      'user',
      JsonApiQueryParser.parse(req.query, UserModel),
    );

    res.json(JsonApiSerializer.serialize(data));
  } catch (err) {
    next(err);
  }
});

reviewRoutes.get('/:id/manga', async (req, res, next) => {
  try {
    const { data } = await MongooseAdapter.findRelationship(
      ReviewModel,
      req.params.id,
      'manga',
      JsonApiQueryParser.parse(req.query, MangaModel),
    );

    res.json(JsonApiSerializer.serialize(data));
  } catch (err) {
    next(err);
  }
});

reviewRoutes.get('/:id/anime', async (req, res, next) => {
  try {
    const { data } = await MongooseAdapter.findRelationship(
      ReviewModel,
      req.params.id,
      'anime',
      JsonApiQueryParser.parse(req.query, AnimeModel),
    );

    res.json(JsonApiSerializer.serialize(data));
  } catch (err) {
    next(err);
  }
});

export default reviewRoutes
