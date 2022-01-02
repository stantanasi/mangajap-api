import express from "express";
import { AnimeEntryModel } from "../models/anime-entry.model";
import { AnimeModel } from "../models/anime.model";
import { UserModel } from "../models/user.model";
import { PermissionDenied } from "../utils/json-api/json-api.error";
import { isLogin } from "../utils/middlewares/middlewares";
import JsonApiQueryParser from "../utils/mongoose-jsonapi/jsonapi-query-parser";
import JsonApiSerializer from "../utils/mongoose-jsonapi/jsonapi-serializer";
import MongooseAdapter from "../utils/mongoose-jsonapi/mongoose-adapter";

const animeEntryRoutes = express.Router();

animeEntryRoutes.get('/', async (req, res, next) => {
  try {
    const { data, count } = await MongooseAdapter.find(
      AnimeEntryModel,
      JsonApiQueryParser.parse(req.query, AnimeEntryModel)
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
      AnimeEntryModel,
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
      AnimeEntryModel,
      req.params.id,
      JsonApiQueryParser.parse(req.query, AnimeEntryModel)
    );

    res.json(JsonApiSerializer.serialize(data));
  } catch (err) {
    next(err);
  }
});

animeEntryRoutes.patch('/:id', isLogin(), async (req, res, next) => {
  try {
    let bearerToken = req.headers.authorization;
    if (bearerToken?.startsWith('Bearer ')) {
      bearerToken = bearerToken.substring(7);
    }

    const user = await UserModel.findOne({
      uid: bearerToken,
    });
    const old = await AnimeEntryModel.findById(req.params.id);
    if (user?.id !== old?.user) {
      throw new PermissionDenied();
    }

    const data = await MongooseAdapter.update(
      AnimeEntryModel,
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
    let bearerToken = req.headers.authorization;
    if (bearerToken?.startsWith('Bearer ')) {
      bearerToken = bearerToken.substring(7);
    }

    const user = await UserModel.findOne({
      uid: bearerToken,
    });
    const old = await AnimeEntryModel.findById(req.params.id);
    if (user?.id !== old?.user) {
      throw new PermissionDenied();
    }

    await MongooseAdapter.delete(
      AnimeEntryModel,
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
      AnimeEntryModel,
      req.params.id,
      'anime',
      JsonApiQueryParser.parse(req.query, AnimeModel),
    );

    res.json(JsonApiSerializer.serialize(data));
  } catch (err) {
    next(err);
  }
});

animeEntryRoutes.get('/:id/user', async (req, res, next) => {
  try {
    const { data } = await MongooseAdapter.findRelationship(
      AnimeEntryModel,
      req.params.id,
      'user',
      JsonApiQueryParser.parse(req.query, UserModel),
    );

    res.json(JsonApiSerializer.serialize(data));
  } catch (err) {
    next(err);
  }
});

export default animeEntryRoutes
