import express from "express";
import { Anime } from "../models/anime.model";
import { Genre } from "../models/genre.model";
import { Manga } from "../models/manga.model";
import { isAdmin } from "../utils/middlewares/middlewares";
import JsonApiQueryParser from "../utils/mongoose-jsonapi/jsonapi-query-parser";
import JsonApiSerializer from "../utils/mongoose-jsonapi/jsonapi-serializer";
import MongooseAdapter from "../utils/mongoose-jsonapi/mongoose-adapter";

const genreRoutes = express.Router();

genreRoutes.get('/', async (req, res, next) => {
  try {
    const { data, count } = await MongooseAdapter.find(
      Genre,
      JsonApiQueryParser.parse(req.query, Genre)
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

genreRoutes.post('/', isAdmin(), async (req, res, next) => {
  try {
    const data = await MongooseAdapter.create(
      Genre,
      JsonApiSerializer.deserialize(req.body)
    );

    res.json(JsonApiSerializer.serialize(data));
  } catch (err) {
    next(err);
  }
});

genreRoutes.get('/:id', async (req, res, next) => {
  try {
    const data = await MongooseAdapter.findById(
      Genre,
      req.params.id,
      JsonApiQueryParser.parse(req.query, Genre)
    );

    res.json(JsonApiSerializer.serialize(data));
  } catch (err) {
    next(err);
  }
});

genreRoutes.patch('/:id', isAdmin(), async (req, res, next) => {
  try {
    const data = await MongooseAdapter.update(
      Genre,
      req.params.id,
      JsonApiSerializer.deserialize(req.body)
    );

    res.json(JsonApiSerializer.serialize(data));
  } catch (err) {
    next(err);
  }
});

genreRoutes.delete('/:id', isAdmin(), async (req, res, next) => {
  try {
    await MongooseAdapter.delete(
      Genre,
      req.params.id,
    );

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});


genreRoutes.get('/:id/manga', async (req, res, next) => {
  try {
    const { data, count } = await MongooseAdapter.findRelationship(
      Genre,
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

genreRoutes.get('/:id/anime', async (req, res, next) => {
  try {
    const { data, count } = await MongooseAdapter.findRelationship(
      Genre,
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

export default genreRoutes
