import express from "express";
import { AnimeModel } from "../models/anime.model";
import { MangaModel } from "../models/manga.model";
import { ThemeModel } from "../models/theme.model";
import { isAdmin } from "../utils/middlewares/middlewares";
import JsonApiQueryParser from "../utils/mongoose-jsonapi/jsonapi-query-parser";
import JsonApiSerializer from "../utils/mongoose-jsonapi/jsonapi-serializer";
import MongooseAdapter from "../utils/mongoose-jsonapi/mongoose-adapter";

const themeRoutes = express.Router();

themeRoutes.get('/', async (req, res, next) => {
  try {
    const { data, count } = await MongooseAdapter.find(
      ThemeModel,
      JsonApiQueryParser.parse(req.query, ThemeModel)
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
      ThemeModel,
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
      ThemeModel,
      req.params.id,
      JsonApiQueryParser.parse(req.query, ThemeModel)
    );

    res.json(JsonApiSerializer.serialize(data));
  } catch (err) {
    next(err);
  }
});

themeRoutes.patch('/:id', isAdmin(), async (req, res, next) => {
  try {
    const data = await MongooseAdapter.update(
      ThemeModel,
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
      ThemeModel,
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
      ThemeModel,
      req.params.id,
      'manga',
      JsonApiQueryParser.parse(req.query, MangaModel),
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
      ThemeModel,
      req.params.id,
      'anime',
      JsonApiQueryParser.parse(req.query, AnimeModel),
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
