import express from "express";
import Anime from "../models/anime.model";
import Manga from "../models/manga.model";
import Theme from "../models/theme.model";
import { isAdmin } from "../utils/middlewares/middlewares";
import JsonApiQueryParser from "../utils/mongoose-jsonapi/jsonapi-query-parser";
import JsonApiSerializer from "../utils/mongoose-jsonapi/jsonapi-serializer";
import MongooseAdapter from "../utils/mongoose-jsonapi/mongoose-adapter";

const themeRoutes = express.Router();

themeRoutes.get('/', async (req, res, next) => {
  try {
    const { data, count } = await MongooseAdapter.find(
      Theme,
      JsonApiQueryParser.parse(req.query, Theme)
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

themeRoutes.post('/', isAdmin(), async (req, res, next) => {
  try {
    const data = await MongooseAdapter.create(
      Theme,
      JsonApiSerializer.deserialize(req.body)
    );

    res.json(JsonApiSerializer.serialize(data));
  } catch (err) {
    next(err);
  }
});

themeRoutes.get('/:id', async (req, res, next) => {
  try {
    const data = await MongooseAdapter.findById(
      Theme,
      req.params.id,
      JsonApiQueryParser.parse(req.query, Theme)
    );

    res.status(data ? 200 : 404).json(JsonApiSerializer.serialize(data));
  } catch (err) {
    next(err);
  }
});

themeRoutes.patch('/:id', isAdmin(), async (req, res, next) => {
  try {
    const data = await MongooseAdapter.update(
      Theme,
      req.params.id,
      JsonApiSerializer.deserialize(req.body)
    );

    res.json(JsonApiSerializer.serialize(data));
  } catch (err) {
    next(err);
  }
});

themeRoutes.delete('/:id', isAdmin(), async (req, res, next) => {
  try {
    await MongooseAdapter.delete(
      Theme,
      req.params.id,
    );

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});


themeRoutes.get('/:id/manga', async (req, res, next) => {
  try {
    const { data, count } = await MongooseAdapter.findRelationship(
      Theme,
      req.params.id,
      'manga',
      JsonApiQueryParser.parse(req.query, Manga),
    );

    res.json(JsonApiSerializer.serialize(data, {
      meta: {
        count: count,
      },
      pagination: {
        url: req.originalUrl,
        count: count!,
        query: req.query,
      },
    }));
  } catch (err) {
    next(err);
  }
});

themeRoutes.get('/:id/anime', async (req, res, next) => {
  try {
    const { data, count } = await MongooseAdapter.findRelationship(
      Theme,
      req.params.id,
      'anime',
      JsonApiQueryParser.parse(req.query, Anime),
    );

    res.json(JsonApiSerializer.serialize(data, {
      meta: {
        count: count,
      },
      pagination: {
        url: req.originalUrl,
        count: count!,
        query: req.query,
      },
    }));
  } catch (err) {
    next(err);
  }
});

export default themeRoutes
